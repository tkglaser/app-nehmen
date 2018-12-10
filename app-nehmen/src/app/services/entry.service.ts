import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntryAdd } from '../models/entry-add.model';
import { Entry } from '../models/entry.model';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';
import { EntryUpdate } from '../models/entry-update.model';
import { UniqueIdService } from './unique-id.service';
import { AutoSuggestion } from '../models/auto-suggestion.model';
import { IndexDbService } from './index-db.service';

function isToday(date: number): boolean {
    const todaysDate = new Date().setHours(0, 0, 0, 0);
    const input = new Date(date).setHours(0, 0, 0, 0);
    return input === todaysDate;
}

function groupKey(e: Entry): string {
    return `${e.description}#${e.calories}`;
}

const byDateDescending = (a: Entry, b: Entry) => {
    if (a.timestamp < b.timestamp) {
        return 1;
    } else if (a.timestamp > b.timestamp) {
        return -1;
    } else {
        return 0;
    }
};

const byFrequencyDescending = (a: AutoSuggestion, b: AutoSuggestion) => {
    if (a.frequency > b.frequency) {
        return 1;
    } else if (a.frequency < b.frequency) {
        return -1;
    } else {
        return 0;
    }
};

const key_entries = 'calory_entries';

@Injectable({
    providedIn: 'root'
})
export class EntryService {
    private entries = new BehaviorSubject<Entry[]>([]);

    constructor(
        private config: ConfigService,
        private localStorageService: LocalStorageService,
        private db: IndexDbService,
        private uuid: UniqueIdService
    ) {
        this.init();
    }

    private async init() {
        await this.migrate();
        const entries = await this.db.getAllEntries();
        this.entries.next(entries);
    }

    addEntry(entry: EntryAdd) {
        const newEntry = {
            calories: +entry.calories,
            description: entry.description,
            id: this.nextId(),
            timestamp: new Date().getTime(),
            exercise: entry.exercise
        };
        const newState = [...this.entries.value, newEntry];
        this.db.upsertEntry(newEntry);
        this.postNewState(newState);
    }

    editEntry(entryUpdate: EntryUpdate) {
        const origEntry = this.entries.value.find(e => e.id === entryUpdate.id);
        if (!origEntry) {
            return;
        }
        const otherEntries = this.entries.value.filter(
            e => e.id !== entryUpdate.id
        );
        const newEntry = {
            ...origEntry,
            calories: +entryUpdate.calories,
            description: entryUpdate.description,
            exercise: entryUpdate.exercise
        };
        const newState = [...otherEntries, newEntry];
        this.db.upsertEntry(newEntry);
        this.postNewState(newState);
    }

    removeEntry(id: string) {
        const newState = this.entries.value.filter(entry => entry.id !== id);
        this.db.removeEntry(id);
        this.postNewState(newState);
    }

    selectAllEntries(): Observable<Entry[]> {
        return this.entries.pipe(
            map(entries => entries.sort(byDateDescending))
        );
    }

    selectEntry(id: string): Observable<Entry> {
        return this.entries.pipe(
            map(entries => entries.find(e => e.id === id))
        );
    }

    selectTodaysEntries(): Observable<Entry[]> {
        return this.selectAllEntries().pipe(
            map(entries => entries.filter(entry => isToday(entry.timestamp)))
        );
    }

    selectOlderEntries(): Observable<Entry[]> {
        return this.selectAllEntries().pipe(
            map(entries => entries.filter(entry => !isToday(entry.timestamp)))
        );
    }

    selectCaloriesLeft() {
        return combineLatest(
            this.config.maxCalories(),
            this.selectTodaysEntries()
        ).pipe(
            map(([totalCalories, todaysEntries]) => {
                const usedCalories = todaysEntries
                    .map(e => (e.exercise ? -e.calories : e.calories))
                    .reduce((a, b) => a + b, 0);
                return totalCalories - usedCalories;
            })
        );
    }

    selectAutoSuggestions(key: string): Observable<AutoSuggestion[]> {
        if ((key || '').length < 3) {
            return of([]);
        }
        if (typeof key === 'object') {
            return of([]);
        }
        const keyLower = key.toLowerCase();
        return this.selectAllEntries().pipe(
            map(entries =>
                entries.filter(e =>
                    (e.description || '').toLowerCase().includes(keyLower)
                )
            ),
            map(entries =>
                entries.reduce((group, current) => {
                    if (!group.has(groupKey(current))) {
                        group.set(groupKey(current), {
                            calories: current.calories,
                            description: current.description,
                            exercise: current.exercise,
                            frequency: 1
                        });
                    } else {
                        group.get(groupKey(current)).frequency++;
                    }
                    return group;
                }, new Map<string, AutoSuggestion>())
            ),
            map(groupMap => Array.from(groupMap.values())),
            map(groups => groups.sort(byFrequencyDescending))
        );
    }

    private postNewState(newState: Entry[]) {
        this.entries.next(newState);
    }

    private nextId() {
        return `local_${this.uuid.newGuid()}`;
    }

    private async migrate() {
        const legacy = this.localStorageService.get<Entry[]>(key_entries, []);
        if (legacy && legacy.length) {
            legacy.forEach(async entry => await this.db.upsertEntry(entry));
            this.localStorageService.delete(key_entries);
        }
    }
}

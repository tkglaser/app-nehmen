import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntryAdd } from '../models/entry-add.model';
import { Entry } from '../models/entry.model';
import { ConfigService } from './config.service';
import { EntryUpdate } from '../models/entry-update.model';
import { UniqueIdService } from './unique-id.service';
import { AutoSuggestion } from '../models/auto-suggestion.model';
import { dayString } from '../utils/date.utils';
import {
    getAllEntries,
    db,
    upsertEntry,
    removeEntry,
    getAutoSuggestionEntries,
    getEntryByDay
} from '../db';

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

@Injectable({
    providedIn: 'root'
})
export class EntryService {
    private entries = new BehaviorSubject<Entry[]>([]);

    constructor(private config: ConfigService, private uuid: UniqueIdService) {
        this.init();
    }

    private async init() {
        const entries = await getEntryByDay(db, new Date());
        this.entries.next(entries);
    }

    addEntry(entry: EntryAdd) {
        const now = new Date();
        const newEntry: Entry = {
            calories: +entry.calories,
            description: entry.description,
            id: this.nextId(),
            timestamp: now.getTime(),
            day: dayString(now),
            exercise: entry.exercise
        };
        const newState = [...this.entries.value, newEntry];
        upsertEntry(db, newEntry);
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
        upsertEntry(db, newEntry);
        this.postNewState(newState);
    }

    removeEntry(id: string) {
        const newState = this.entries.value.filter(entry => entry.id !== id);
        removeEntry(db, id);
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
        const today = dayString(new Date());
        return this.selectAllEntries().pipe(
            map(entries => entries.filter(entry => entry.day === today))
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
        if ((key || '').length < 2) {
            return of([]);
        }
        if (typeof key === 'object') {
            return of([]);
        }
        return from(getAutoSuggestionEntries(db, key)).pipe(
            map(entries => entries.sort(byFrequencyDescending))
        );
    }

    private postNewState(newState: Entry[]) {
        this.entries.next(newState);
    }

    private nextId() {
        return `local_${this.uuid.newGuid()}`;
    }
}

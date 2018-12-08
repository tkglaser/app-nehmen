import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntryAdd } from '../models/entry-add.model';
import { Entry } from '../models/entry.model';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';
import { EntryUpdate } from '../models/entry-update.model';
import { UniqueIdService } from './unique-id.service';

function isToday(date: Date): boolean {
    const todaysDate = new Date().setHours(0, 0, 0, 0);
    const input = new Date(date.valueOf()).setHours(0, 0, 0, 0);
    return input === todaysDate;
}

const sortByDateDesc = map((entries: Entry[]) =>
    entries.sort((a, b) => {
        if (a.timestamp < b.timestamp) {
            return 1;
        } else if (a.timestamp > b.timestamp) {
            return -1;
        } else {
            return 0;
        }
    })
);

const key_entries = 'calory_entries';

@Injectable({
    providedIn: 'root'
})
export class EntryService {
    private entries = new BehaviorSubject<Entry[]>([]);

    constructor(
        private config: ConfigService,
        private localStorageService: LocalStorageService,
        private uuid: UniqueIdService
    ) {
        this.entries.next(localStorageService.get(key_entries, []));
    }

    addEntry(entry: EntryAdd) {
        const newState = [
            ...this.entries.value,
            {
                calories: +entry.calories,
                description: entry.description,
                id: this.nextId(),
                timestamp: new Date()
            }
        ];
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
        const newState = [...otherEntries, { ...origEntry, ...entryUpdate }];
        this.postNewState(newState);
    }

    removeEntry(id: string) {
        const newState = this.entries.value.filter(entry => entry.id !== id);
        this.postNewState(newState);
    }

    selectAllEntries(): Observable<Entry[]> {
        return this.entries.pipe(sortByDateDesc);
    }

    selectTodaysEntries(): Observable<Entry[]> {
        return this.selectAllEntries().pipe(
            map(entries => entries.filter(entry => isToday(entry.timestamp))),
            sortByDateDesc
        );
    }

    selectCaloriesLeft() {
        return combineLatest(
            this.config.maxCalories(),
            this.selectTodaysEntries()
        ).pipe(
            map(([totalCalories, todaysEntries]) => {
                const usedCalories = todaysEntries
                    .map(e => e.calories)
                    .reduce((a, b) => a + b, 0);
                return totalCalories - usedCalories;
            })
        );
    }

    private postNewState(newState: Entry[]) {
        this.localStorageService.set(key_entries, newState);
        this.entries.next(newState);
    }

    private nextId() {
        return `newEntry_${this.uuid.newGuid()}`;
    }
}

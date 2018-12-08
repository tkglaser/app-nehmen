import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntryAdd } from '../models/entry-add.model';
import { Entry } from '../models/entry.model';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';

function isToday(date: Date): boolean {
    const todaysDate = new Date().setHours(0, 0, 0, 0);
    const input = new Date(date.valueOf()).setHours(0, 0, 0, 0);
    return input === todaysDate;
}

let entryId = 0;

const key = 'calory_entries';

@Injectable({
    providedIn: 'root'
})
export class EntryService {
    private entries = new BehaviorSubject<Entry[]>([]);

    constructor(
        private config: ConfigService,
        private localStorageService: LocalStorageService
    ) {
        this.entries.next(localStorageService.get(key, []));
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

    removeEntry(id: string) {
        const newState = this.entries.value.filter(entry => entry.id !== id);
        this.postNewState(newState);
    }

    selectAllEntries(): Observable<Entry[]> {
        return this.entries.asObservable();
    }

    selectTodaysEntries(): Observable<Entry[]> {
        return this.selectAllEntries().pipe(
            map(entries => entries.filter(entry => isToday(entry.timestamp)))
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
        this.localStorageService.set(key, newState);
        this.entries.next(newState);
    }

    private nextId() {
        return `newEntry_${entryId++}`;
    }
}

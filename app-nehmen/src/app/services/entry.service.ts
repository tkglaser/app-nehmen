import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of, from } from 'rxjs';
import {
    map,
    filter,
    switchMap,
    shareReplay
} from 'rxjs/operators';

import { EntryAdd } from '../models/entry-add.model';
import { Entry } from '../models/entry.model';
import { ConfigService } from './config.service';
import { EntryUpdate } from '../models/entry-update.model';
import { UniqueIdService } from './unique-id.service';
import { AutoSuggestion } from '../models/auto-suggestion.model';
import { dayString, todayString } from '../utils/date.utils';
import {
    db,
    upsertEntry,
    removeEntry,
    getAutoSuggestionEntries,
    getEntriesByDay,
    hasEntriesOlderThan,
    getEntryById
} from '../db';

const byTimestampDescending = (a: Entry, b: Entry) => {
    if (a.timestamp < b.timestamp) {
        return 1;
    } else if (a.timestamp > b.timestamp) {
        return -1;
    } else {
        return 0;
    }
};

const byFrequencyDescending = (a: AutoSuggestion, b: AutoSuggestion) => {
    if (a.frequency < b.frequency) {
        return 1;
    } else if (a.frequency > b.frequency) {
        return -1;
    } else {
        return 0;
    }
};

@Injectable({
    providedIn: 'root'
})
export class EntryService {
    private entriesToday = new BehaviorSubject<Entry[]>([]);

    constructor(private config: ConfigService, private uuid: UniqueIdService) {
        this.loadToday();
    }

    private async loadToday() {
        const entries = await getEntriesByDay(db, todayString());
        this.entriesToday.next(entries);
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
        upsertEntry(db, newEntry);
        this.loadToday();
    }

    editEntry(entryUpdate: EntryUpdate) {
        this.selectEntry(entryUpdate.id)
            .pipe(
                filter(entry => !!entry),
                switchMap(origEntry => {
                    const newEntry = {
                        ...origEntry,
                        calories: +entryUpdate.calories,
                        description: entryUpdate.description,
                        exercise: entryUpdate.exercise
                    };
                    return from(upsertEntry(db, newEntry));
                }),
                switchMap(() => from(this.loadToday()))
            )
            .subscribe();
    }

    removeEntry(id: string) {
        removeEntry(db, id);
        this.loadToday();
    }

    selectEntry(id: string): Observable<Entry> {
        return from(getEntryById(db, id));
    }

    selectTodaysEntries(): Observable<Entry[]> {
        return this.entriesToday;
    }

    selectDayEntries(day: string) {
        return from(getEntriesByDay(db, day)).pipe(
            map(entries => entries.sort(byTimestampDescending)),
            shareReplay(1)
        );
    }

    hasMoreBeforeThatDay(day: string) {
        return from(hasEntriesOlderThan(db, day));
    }

    selectCaloriesLeft() {
        return combineLatest(this.config.maxCalories(), this.entriesToday).pipe(
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

    private nextId() {
        return `local_${this.uuid.newGuid()}`;
    }
}

import { Injectable, OnDestroy } from '@angular/core';
import {
    BehaviorSubject,
    combineLatest,
    from,
    Observable,
    of,
    Subscription
} from 'rxjs';
import {  map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import {
    db,
    getAutoSuggestionEntries,
    getEntriesByDay,
    getEntryById,
    hasEntriesOlderThan,
    upsertEntry
} from '../db';
import { DropboxAuthService } from '../dropbox/services/dropbox-auth.service';
import {
    AutoSuggestion,
    EntryAddModel,
    EntryModel,
    EntryUpdateModel,
    SyncState
} from '../models';
import { dayString, todayString } from '../utils';
import { ClockService } from './clock.service';
import { ConfigService } from './config.service';
import { UniqueIdService } from './unique-id.service';

const byTimestampDescending = (a: EntryModel, b: EntryModel) => {
    if (a.created < b.created) {
        return 1;
    } else if (a.created > b.created) {
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

const dropboxPollInterval = 1 * 60 * 1000;

@Injectable({
    providedIn: 'root'
})
export class EntryService implements OnDestroy {
    private entriesToday = new BehaviorSubject<EntryModel[]>([]);
    private reloader: Subscription;
    private dbxpoll: any;

    constructor(
        private config: ConfigService,
        private uuid: UniqueIdService,
        private clockService: ClockService,
        private dropbox: DropboxAuthService
    ) {
        this.init();
    }

    private init() {
        this.dropbox.scheduleSync();
        this.dbxpoll = setInterval(() => {
            this.dropbox.scheduleSync();
        }, dropboxPollInterval);
        this.reloader = combineLatest(
            this.clockService.today(),
            this.dropbox.onSyncFinished().pipe(startWith(null))
        )
            .pipe(
                switchMap(([today]) => from(getEntriesByDay(db, today))),
                map(entries => entries.sort(byTimestampDescending))
            )
            .subscribe(entries => this.entriesToday.next(entries));
    }

    ngOnDestroy(): void {
        clearInterval(this.dbxpoll);
        this.reloader.unsubscribe();
    }

    async loadToday() {
        const entries = await getEntriesByDay(db, todayString());
        this.entriesToday.next(entries.sort(byTimestampDescending));
    }

    async addEntry(entry: EntryAddModel) {
        const now = new Date();
        const newEntry: EntryModel = {
            calories: +entry.calories,
            description: entry.description,
            id: this.nextId(),
            created: now.getTime(),
            modified: now.getTime(),
            day: dayString(now),
            exercise: entry.exercise,
            sync_state: SyncState.Dirty
        };
        await upsertEntry(db, newEntry);
        await this.dropbox.scheduleSync();
        this.loadToday();
    }

    // async editEntry(entryUpdate: EntryUpdate) {
    //     const entry = await getEntryById(db, entryUpdate.id);
    //     if (!entry) {
    //         return;
    //     }
    //     await upsertEntry(db, {
    //         ...entry,
    //         modified: new Date().getTime(),
    //         sync_state: SyncState.Dirty,
    //         calories: +entryUpdate.calories,
    //         description: entryUpdate.description,
    //         exercise: entryUpdate.exercise
    //     });
    //     await this.dropbox.scheduleSync();
    //     this.loadToday();
    // }

    async removeEntry(id: string) {
        const entry = await getEntryById(db, id);
        if (!entry) {
            return;
        }
        await upsertEntry(db, {
            ...entry,
            sync_state: SyncState.Deleted,
            modified: new Date().getTime()
        });
        await this.dropbox.scheduleSync();
        this.loadToday();
    }

    selectEntry(id: string): Observable<EntryModel> {
        return from(getEntryById(db, id));
    }

    selectTodaysEntries(): Observable<EntryModel[]> {
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
        if (!key) {
            return of([]);
        }
        if (typeof key === 'object') {
            return of([]);
        }
        return from(getAutoSuggestionEntries(db, key)).pipe(
            map(entries => entries.sort(byFrequencyDescending)),
            map(entries => entries.slice(0, 4))
        );
    }

    private nextId() {
        return `${new Date().getTime()}${this.uuid.newGuid()}`;
    }
}

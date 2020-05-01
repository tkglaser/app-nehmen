import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntryModel } from '../models';
import { selectEntriesByDay, selectConfig } from '../store';
import { isDayOfWeekToday, todayString } from '../utils';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    caloriesLeft$: Observable<number>;
    entries$: Observable<EntryModel[]>;
    isCheatDay$: Observable<boolean>;

    constructor(private store: Store) {}

    ngOnInit(): void {
        this.entries$ = this.store.select(selectEntriesByDay(todayString()));
        this.caloriesLeft$ = combineLatest(
            this.store.select(selectConfig),
            this.entries$
        ).pipe(
            map(([cfg, todaysEntries]) => {
                const usedCalories = todaysEntries
                    .map((e) => (e.exercise ? -e.calories : e.calories))
                    .reduce((a, b) => a + b, 0);
                return cfg.maxCalories - usedCalories;
            })
        );
        this.isCheatDay$ = this.store
            .select(selectConfig)
            .pipe(
                map(
                    (cfg) =>
                        cfg.cheatDay !== 'none' &&
                        isDayOfWeekToday(cfg.cheatDay)
                )
            );
    }
}

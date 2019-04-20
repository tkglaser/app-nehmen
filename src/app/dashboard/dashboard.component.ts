import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntryModel } from '../models';
import { ConfigService } from '../services';
import { EntriesState } from '../store/entries.state';
import { todayString } from '../utils';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    caloriesLeft$: Observable<number>;
    entries$: Observable<EntryModel[]>;
    isCheatDay$: Observable<boolean>;

    constructor(
        private store: Store,
        private configService: ConfigService
    ) {}

    ngOnInit(): void {
        this.entries$ = this.store.select(
            EntriesState.entriesByDay(todayString())
        );
        this.caloriesLeft$ = combineLatest(
            this.configService.maxCalories(),
            this.entries$
        ).pipe(
            map(([totalCalories, todaysEntries]) => {
                const usedCalories = todaysEntries
                    .map(e => (e.exercise ? -e.calories : e.calories))
                    .reduce((a, b) => a + b, 0);
                return totalCalories - usedCalories;
            })
        );
        this.isCheatDay$ = this.configService.isCheatDay();
    }
}

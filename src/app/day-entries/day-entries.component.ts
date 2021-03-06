import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { EntryModel } from '../models';
import { friendlyDay, nextDay, prevDay, todayString } from '../utils';
import { selectEntriesByDay, selectHasEntriesOlderThan } from '../store';
import { snapshot } from '../utils/ngrx.utils';

@Component({
    selector: 'app-day-entries',
    templateUrl: './day-entries.component.html',
    styleUrls: ['./day-entries.component.scss'],
})
export class DayEntriesComponent implements OnInit {
    dataSource$: Observable<EntryModel[]>;
    currentDay: string;
    currentDayFormatted: string;
    canGoNext = true;
    canGoPrev = true;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store
    ) {}

    ngOnInit() {
        this.route.params
            .pipe(pluck<Params, string>('id'))
            .subscribe((id) => this.onIdChange(id));
    }

    onIdChange(id: string) {
        this.currentDay = id === 'today' ? todayString() : id;
        this.currentDayFormatted = friendlyDay(this.currentDay);
        this.canGoNext = this.currentDay !== todayString();
        this.canGoPrev = snapshot(
            this.store,
            selectHasEntriesOlderThan(this.currentDay)
        );
        this.dataSource$ = this.store.select(
            selectEntriesByDay(this.currentDay)
        );
    }

    onGoPrev() {
        this.router.navigate(['day', prevDay(this.currentDay)]);
    }

    onGoNext() {
        this.router.navigate(['day', nextDay(this.currentDay)]);
    }
}

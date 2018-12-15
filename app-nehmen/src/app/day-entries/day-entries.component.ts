import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { EntryService } from '../services/entry.service';
import { Entry } from '../models/entry.model';
import { todayString, nextDay, prevDay } from '../utils/date.utils';

@Component({
    selector: 'app-day-entries',
    templateUrl: './day-entries.component.html',
    styleUrls: ['./day-entries.component.scss']
})
export class DayEntriesComponent implements OnInit {
    dataSource$: Observable<Entry[]>;
    currentDay: string;
    canGoNext = true;
    canGoPrev = true;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private entryService: EntryService
    ) {}

    ngOnInit() {
        this.route.params
            .pipe(pluck<Params, string>('id'))
            .subscribe(id => this.onIdChange(id));
    }

    onIdChange(id: string) {
        this.currentDay = id === 'today' ? todayString() : id;
        this.canGoNext = this.currentDay !== todayString();
        this.entryService
            .hasMoreBeforeThatDay(this.currentDay)
            .subscribe(hasPrev => (this.canGoPrev = hasPrev));
        this.dataSource$ = this.entryService.selectDayEntries(this.currentDay);
    }

    onGoPrev() {
        this.router.navigate(['day', prevDay(this.currentDay)]);
    }

    onGoNext() {
        this.router.navigate(['day', nextDay(this.currentDay)]);
    }
}

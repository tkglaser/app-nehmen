import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { EntryModel } from '../models';
import { todayString } from '../utils';
import { selectEntriesByDay } from '../store';

@Component({
    selector: 'app-todays-entries',
    templateUrl: './todays-entries.component.html',
    styleUrls: ['./todays-entries.component.scss'],
})
export class TodaysEntriesComponent implements OnInit {
    displayedColumns: string[] = [
        'description',
        'calories',
        'timestamp',
        'actions',
    ];
    dataSource$: Observable<EntryModel[]>;

    constructor(private store: Store) {}

    ngOnInit() {
        this.dataSource$ = this.store.select(selectEntriesByDay(todayString()));
    }
}

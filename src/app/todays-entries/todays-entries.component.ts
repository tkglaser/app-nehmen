import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { EntryModel } from '../models';
import { EntriesState } from '../store/entries.state';
import { todayString } from '../utils';

@Component({
    selector: 'app-todays-entries',
    templateUrl: './todays-entries.component.html',
    styleUrls: ['./todays-entries.component.scss']
})
export class TodaysEntriesComponent implements OnInit {
    displayedColumns: string[] = [
        'description',
        'calories',
        'timestamp',
        'actions'
    ];
    dataSource$: Observable<EntryModel[]>;

    constructor(private store: Store) {}

    ngOnInit() {
        this.dataSource$ = this.store.select(
            EntriesState.entriesByDay(todayString())
        );
    }
}

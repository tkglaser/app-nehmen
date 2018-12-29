import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { EntryService } from '../services/entry.service';
import { Entry } from '../models';

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
    dataSource$: Observable<Entry[]>;

    constructor(
        private entriesService: EntryService,
    ) {}

    ngOnInit() {
        this.dataSource$ = this.entriesService.selectTodaysEntries();
    }
}

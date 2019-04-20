import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { EntryModel } from '../models';
import { EntryService } from '../services/entry.service';

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

    constructor(
        private entriesService: EntryService,
    ) {}

    ngOnInit() {
        this.dataSource$ = this.entriesService.selectTodaysEntries();
    }
}

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { EntryService } from '../services/entry.service';
import { Entry } from '../models/entry.model';
import { Router } from '@angular/router';

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
        private router: Router
    ) {}

    ngOnInit() {
        this.dataSource$ = this.entriesService.selectTodaysEntries();
    }
}

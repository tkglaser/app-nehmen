import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';

import { EntryService } from '../services/entry.service';
import { Entry } from '../models/entry.model';
import { EditEntryDialogComponent } from '../edit-entry-dialog/edit-entry-dialog.component';

@Component({
    selector: 'app-todays-entries',
    templateUrl: './todays-entries.component.html',
    styleUrls: ['./todays-entries.component.scss']
})
export class TodaysEntriesComponent implements OnInit {
    displayedColumns: string[] = [
        'calories',
        'description',
        'timestamp',
        'actions'
    ];
    dataSource$: Observable<Entry[]>;

    constructor(
        private entriesService: EntryService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.dataSource$ = this.entriesService.selectTodaysEntries();
    }

    onRowClick(entry: Entry) {
        this.dialog.open(EditEntryDialogComponent, {
            width: '350px',
            data: { entry }
        });
    }
}

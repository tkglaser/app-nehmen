import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';

import { EntryService } from '../services/entry.service';
import { Entry } from '../models/entry.model';
import { EditEntryDialogComponent } from '../edit-entry-dialog/edit-entry-dialog.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    caloriesLeft$: Observable<number>;
    entries$: Observable<Entry[]>;

    constructor(
        private entriesService: EntryService,
        public dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.caloriesLeft$ = this.entriesService.selectCaloriesLeft();
        this.entries$ = this.entriesService.selectTodaysEntries();
    }

    onEntryClick(entry: Entry) {
        this.dialog.open(EditEntryDialogComponent, {
            width: '350px',
            data: { entry }
        });
    }
}

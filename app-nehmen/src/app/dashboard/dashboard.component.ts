import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Entry } from '../models/entry.model';
import { EntryService, ConfigService, DropboxService } from '../services';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    caloriesLeft$: Observable<number>;
    entries$: Observable<Entry[]>;
    isCheatDay$: Observable<boolean>;

    constructor(
        private entriesService: EntryService,
        private configService: ConfigService,
        private dropboxService: DropboxService
    ) {}

    ngOnInit(): void {
        this.caloriesLeft$ = this.entriesService.selectCaloriesLeft();
        this.entries$ = this.entriesService.selectTodaysEntries();
        this.isCheatDay$ = this.configService.isCheatDay();
        // this.dropboxService.login();
    }
}

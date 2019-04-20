import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { EntryModel } from '../models';
import { ConfigService, EntryService } from '../services';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    caloriesLeft$: Observable<number>;
    entries$: Observable<EntryModel[]>;
    isCheatDay$: Observable<boolean>;

    constructor(
        private entriesService: EntryService,
        private configService: ConfigService
    ) {}

    ngOnInit(): void {
        this.caloriesLeft$ = this.entriesService.selectCaloriesLeft();
        this.entries$ = this.entriesService.selectTodaysEntries();
        this.isCheatDay$ = this.configService.isCheatDay();
    }
}

import { Component, OnInit } from '@angular/core';

import { SyncLogEntry } from '../../models/sync-log-entry.model';
import { getAll, db, clear } from '../../db';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-sync-log',
    templateUrl: './sync-log.component.html',
    styleUrls: ['./sync-log.component.scss']
})
export class SyncLogComponent implements OnInit {
    logs = new BehaviorSubject<SyncLogEntry[]>([]);
    displayedColumns = ['timestamp', 'message'];

    constructor() {}

    ngOnInit() {
        this.refresh();
    }

    async onClear() {
        await clear(db);
        await this.refresh();
    }

    private async refresh() {
        const logs = await getAll(db);
        this.logs.next(logs);
    }
}

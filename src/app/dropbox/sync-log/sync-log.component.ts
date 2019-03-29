import { Component, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { SyncLogEntry } from '../../models/sync-log-entry.model';
import { getAll, db, clear, getSetting } from '../../db';
import { WorkerStatus, WorkerMode, workerStateKey } from 'src/app/models';
import { ClockService } from 'src/app/services';

@Component({
    selector: 'app-sync-log',
    templateUrl: './sync-log.component.html',
    styleUrls: ['./sync-log.component.scss']
})
export class SyncLogComponent implements OnInit {
    logs: Observable<SyncLogEntry[]>;
    workerState: Observable<WorkerStatus>;
    displayedColumns = ['timestamp', 'message'];

    constructor(private clock: ClockService) {}

    ngOnInit() {
        this.logs = this.clock.poll(() =>
            from(getAll(db)).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            )
        );
        this.workerState = this.clock.poll(() =>
            from(
                getSetting<WorkerStatus>(db, workerStateKey, {
                    mode: WorkerMode.Idle
                })
            )
        );
    }

    async onClear() {
        await clear(db);
    }
}

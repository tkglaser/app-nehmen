import { Component, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material';

import { DropboxService, EntryService } from '../services';
import { db, getEntriesPage, countEntries } from '../db';
import { Entry } from '../models/entry.model';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-dropbox-test',
    templateUrl: './dropbox-test.component.html',
    styleUrls: ['./dropbox-test.component.scss']
})
export class DropboxTestComponent implements OnInit {
    loggedIn = false;
    folders: any;
    latest: any;
    busy = false;
    progressPct: number;
    mode: ProgressSpinnerMode;

    constructor(
        private dropboxService: DropboxService,
        private entryService: EntryService
    ) {
        this.loggedIn = this.dropboxService.isLoggedIn();
    }

    async ngOnInit() {
        if (this.loggedIn) {
            this.folders = await this.dropboxService.getList();
        }
    }

    async onLatest() {
        this.latest = await this.dropboxService.getLatest();
    }

    onLogin() {
        this.dropboxService.login();
    }

    async copyAllToCloud() {
        const total = await countEntries(db);
        if (total < 1) {
            return;
        }

        this.progressPct = 0;
        this.mode = 'indeterminate';
        this.busy = true;
        let hasMore: boolean;
        let page = 0;
        let savedSoFar = 0;
        do {
            const entries = await getEntriesPage(db, 10, page++);
            hasMore = entries.hasMore;
            await this.dropboxService.pushEntries(entries.items);
            savedSoFar += entries.items.length;
            this.progressPct = (savedSoFar * 100) / total;
            this.mode = 'determinate';
        } while (hasMore);
        this.busy = false;
    }

    async downloadAll() {
        this.progressPct = 0;
        this.mode = 'indeterminate';
        this.busy = true;
        const list = await this.dropboxService.getList();
        const results = await forkJoin(
            list.map(entry =>
                this.dropboxService.download<Entry>(entry.path_lower)
            )
        ).toPromise();
        await forkJoin(
            results.map(entry => this.entryService.recoverEntry(entry))
        ).toPromise();
        this.entryService.loadToday();
        this.busy = false;
    }
}

import { Component, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material';

import { EntryService } from '../../services';
import {
    db,
    getUnsyncedEntriesPage,
    countUnsyncedEntries,
    getEntryById,
    upsertEntry,
    removeEntry
} from '../../db';
import { forkJoin } from 'rxjs';
import { Entry, SyncState } from '../../models';
import { fromDropboxString } from '../../utils';
import { DropboxService } from '../services/dropbox.service';

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
    hasLocalChanges = true;

    constructor(
        private dropboxService: DropboxService,
        private entryService: EntryService
    ) {
        this.loggedIn = this.dropboxService.isLoggedIn();
        this.updateHasLocalChanges();
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

    async updateHasLocalChanges() {
        const total = await countUnsyncedEntries(db);
        this.hasLocalChanges = total > 0;
    }

    async copyAllToCloud() {
        const total = await countUnsyncedEntries(db);
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
            const entries = await getUnsyncedEntriesPage(db, 10, page++);
            hasMore = entries.hasMore;
            savedSoFar += entries.items.length;
            const itemsToCopy = entries.items.filter(
                entry => entry.sync_state === SyncState.Dirty
            );
            await this.copyToCloud(itemsToCopy);
            const itemsToDelete = entries.items.filter(
                entry => entry.sync_state === SyncState.Deleted
            );
            await this.deleteOnCloud(itemsToDelete);
            this.progressPct = (savedSoFar * 100) / total;
            this.mode = 'determinate';
        } while (hasMore);
        this.busy = false;
        this.updateHasLocalChanges();
    }

    async copyToCloud(entries: Entry[]) {
        if (!entries.length) {
            return;
        }
        const pushResults = await this.dropboxService.pushEntries(entries);

        for (const pushResult of pushResults) {
            if (pushResult['.tag'] === 'success') {
                const id = pushResult.name.replace('.json', '');
                const entry = await getEntryById(db, id);
                if (entry) {
                    const patch = {
                        ...entry,
                        sync_state: SyncState.Synced,
                        modified: fromDropboxString(pushResult.server_modified)
                    };
                    await upsertEntry(db, patch);
                }
            }
        }
    }

    async deleteOnCloud(entries: Entry[]) {
        if (!entries.length) {
            return;
        }
        const pushResults = await this.dropboxService.deleteEntries(entries);
        for (const pushResult of pushResults) {
            if (pushResult['.tag'] === 'success') {
                const id = pushResult.metadata.name.replace('.json', '');
                await removeEntry(db, id);
            }
        }
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

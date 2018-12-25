import { Component, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material';
import { FormControl } from '@angular/forms';

import { EntryService } from '../../services';
import { db, countUnsyncedEntries } from '../../db';
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
    continousSync = new FormControl(false);

    constructor(
        private dropboxService: DropboxService,
        private entryService: EntryService
    ) {}

    async ngOnInit() {
        this.loggedIn = await this.dropboxService.isLoggedIn();
        this.updateHasLocalChanges();
        if (this.loggedIn) {
            // this.folders = await this.dropboxService.getList();
        }
        this.continousSync.valueChanges.subscribe(value => {
            this.dropboxService.setPeriodicSync(value);
        });
    }

    onLogin() {
        window.location.href = this.dropboxService.getLoginUrl();
    }

    onLogout() {
        this.dropboxService.logout();
        this.loggedIn = false;
    }

    async updateHasLocalChanges() {
        const total = await countUnsyncedEntries(db);
        this.hasLocalChanges = total > 0;
    }

    async copyAllToCloud() {
        this.progressPct = 0;
        this.mode = 'indeterminate';
        this.busy = true;
        this.dropboxService.syncUpToCloud();
        this.updateHasLocalChanges();
        this.busy = false;
    }

    async downloadAll() {
        this.mode = 'indeterminate';
        this.busy = true;
        await this.dropboxService.syncDownToLocal();
        this.entryService.loadToday();
        this.updateHasLocalChanges();
        this.busy = false;
    }
}

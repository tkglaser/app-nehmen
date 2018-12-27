import { Component, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material';
import { FormControl } from '@angular/forms';

import { DropboxAuthService } from '../services/dropbox-auth.service';

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
    continousSync = new FormControl(false);

    constructor(private dropboxService: DropboxAuthService) {}

    async ngOnInit() {
        this.loggedIn = await this.dropboxService.isLoggedIn();
    }

    onLogin() {
        window.location.href = this.dropboxService.getLoginUrl();
    }

    onLogout() {
        this.dropboxService.logout();
        this.loggedIn = false;
    }
}

import { Component, OnInit } from '@angular/core';

import { DropboxAuthService } from '../services/dropbox-auth.service';

@Component({
    selector: 'app-dropbox-settings',
    templateUrl: './dropbox-settings.component.html',
    styleUrls: ['./dropbox-settings.component.scss']
})
export class DropboxSettingsComponent implements OnInit {
    loggedIn = false;

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

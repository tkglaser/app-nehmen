import { Component, OnInit } from '@angular/core';

import { DropboxService } from '../services';
import { db, getEntriesPage } from '../db';

@Component({
    selector: 'app-dropbox-test',
    templateUrl: './dropbox-test.component.html',
    styleUrls: ['./dropbox-test.component.scss']
})
export class DropboxTestComponent implements OnInit {
    loggedIn = false;
    folders: any;
    latest: any;

    constructor(private dropboxService: DropboxService) {
        console.log(location);

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
        let hasMore: boolean;
        let page = 0;
        do {
            const entries = await getEntriesPage(db, 10, page++);
            hasMore = entries.hasMore;
            entries.items.forEach(async entry => {
                await this.dropboxService.pushEntry(entry);
            });
        } while (hasMore);
    }
}

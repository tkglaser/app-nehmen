import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import * as dbx from 'dropbox';
import * as fetch from 'isomorphic-fetch';
import { Subject } from 'rxjs';

import { db } from 'src/app/db';
import { DropboxState } from '../models';
import { loadState, saveState } from './dropbox.service';

const clientId = '988bai9urdqlw6l';

@Injectable({
    providedIn: 'root'
})
export class DropboxAuthService {
    private state: DropboxState;
    private isLoaded: Promise<void>;
    private needsReload = new Subject<void>();

    constructor(private location: Location) {
        this.init();
    }

    async isLoggedIn() {
        await this.isLoaded;
        return !!(this.state && this.state.accessToken);
    }

    getLoginUrl() {
        const returnUrl =
            location.origin + this.location.prepareExternalUrl('/dropbox/auth');
        const dropbox = new dbx.Dropbox({
            clientId,
            fetch
        } as any);
        return dropbox.getAuthenticationUrl(returnUrl);
    }

    async login(accesstoken: string) {
        await this.isLoaded;
        this.state.accessToken = accesstoken;
        return saveState(db, this.state);
    }

    async scheduleSync() {
        const isAuth = await this.isLoggedIn();
        if (isAuth) {
            const swReg = await navigator.serviceWorker.ready;
            swReg.sync.register('calories_updated');
        }
    }

    onSyncFinished() {
        return this.needsReload.asObservable();
    }

    logout() {
        this.state.accessToken = '';
        this.state.changesCursor = '';
        return saveState(db, this.state);
    }

    private async init() {
        this.isLoaded = new Promise(async resolve => {
            this.state = await loadState(db);
            resolve();
        });
        if (navigator && navigator.serviceWorker) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data === 'sync_finished') {
                    this.needsReload.next();
                }
            });
        }
    }
}

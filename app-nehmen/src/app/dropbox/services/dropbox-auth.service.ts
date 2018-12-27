import { Injectable } from '@angular/core';
import * as dbx from 'dropbox';
import * as fetch from 'isomorphic-fetch';
import { Location } from '@angular/common';

import { DropboxState } from '../models';
import { db } from 'src/app/db';
import { saveState } from './dropbox.service';

const clientId = '988bai9urdqlw6l';

@Injectable({
    providedIn: 'root'
})
export class DropboxAuthService {
    private state: DropboxState;
    private isLoaded: Promise<void>;

    constructor(private location: Location) {}

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

    logout() {
        this.state.accessToken = '';
        this.state.changesCursor = '';
        return saveState(db, this.state);
    }
}

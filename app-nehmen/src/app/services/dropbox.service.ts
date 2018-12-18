import { Injectable } from '@angular/core';
import { Dropbox } from 'dropbox';
import * as fetch from 'isomorphic-fetch';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

const clientId = '988bai9urdqlw6l';

@Injectable({
    providedIn: 'root'
})
export class DropboxService {
    private accessToken: string;
    private latestCursor: DropboxTypes.files.ListFolderCursor;

    constructor(private router: Router, private location: Location) {}

    login() {
        const returnUrl =
            location.origin + this.location.prepareExternalUrl('/auth');
        const dbx = new Dropbox({
            clientId,
            fetch
        } as any);
        const authUrl = dbx.getAuthenticationUrl(returnUrl);
        window.location.href = authUrl;
    }

    isLoggedIn() {
        return !!this.accessToken;
    }

    setToken(accesstoken: string) {
        this.accessToken = accesstoken;
    }

    getList() {
        return this.dbx().filesListFolder({ path: '' });
    }

    async getLatest() {
        if (!this.latestCursor) {
            const cursor = await this.dbx().filesListFolderGetLatestCursor({
                path: '',
                include_deleted: true,
                include_media_info: true
            });
            this.latestCursor = cursor.cursor;
        }
        const result = await this.dbx().filesListFolderContinue({
            cursor: this.latestCursor
        });
        this.latestCursor = result.cursor; // move to next, do not do if you need to repeat the call
        return result;
    }

    async doStuff(accessToken: string) {
        const dbx = new Dropbox({ accessToken, fetch } as any);
        const list = await dbx.filesListFolder({ path: '' });
        console.log(list);
        const result = await dbx.filesUpload({
            path: '/test-file.json',
            contents: JSON.stringify({ test: 'value' }),
        });
        console.log(result);
    }

    async copyAllToCloud() {

    }

    private dbx() {
        return new Dropbox({
            accessToken: this.accessToken,
            fetch
        } as any);
    }
}

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

    constructor(private router: Router, private location: Location) {}

    login() {
        const returnUrl = location.origin + this.location.prepareExternalUrl('/auth');
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

    async getList() {
        const dbx = new Dropbox({
            accessToken: this.accessToken,
            fetch
        } as any);
        return dbx.filesListFolder({ path: '' });
    }

    async doStuff(accessToken: string) {
        const dbx = new Dropbox({ accessToken, fetch } as any);
        const list = await dbx.filesListFolder({ path: '' });
        console.log(list);
        const result = await dbx.filesUpload({
            path: '/test-file.json',
            contents: JSON.stringify({ test: 'value' })
        });
        console.log(result);
    }
}

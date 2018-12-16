import { Injectable } from '@angular/core';
import { Dropbox } from 'dropbox';
import * as fetch from 'isomorphic-fetch';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class DropboxService {
    accesstoken: string;

    constructor(private router: Router) {}

    login() {
        const dbx = new Dropbox({
            clientId: '988bai9urdqlw6l',
            fetch
        } as any);
        const authUrl = dbx.getAuthenticationUrl('http://localhost:4200/auth');
        window.location.href = authUrl;
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

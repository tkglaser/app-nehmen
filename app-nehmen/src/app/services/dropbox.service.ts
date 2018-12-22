import { Injectable } from '@angular/core';
import * as dbx from 'dropbox';
import * as fetch from 'isomorphic-fetch';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Entry } from '../models/entry.model';
import { toDropboxString } from '../utils/date.utils';
import { forkJoin, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

const clientId = '988bai9urdqlw6l';

@Injectable({
    providedIn: 'root'
})
export class DropboxService {
    private accessToken: string;
    private latestCursor: DropboxTypes.files.ListFolderCursor;
    private _dbx: dbx.Dropbox;
    private get dbx() {
        if (!this._dbx) {
            this._dbx = new dbx.Dropbox({
                accessToken: this.accessToken,
                fetch
            } as any);
        }
        return this._dbx;
    }

    constructor(private router: Router, private location: Location) {}

    login() {
        const returnUrl =
            location.origin + this.location.prepareExternalUrl('/auth');
        const dropbox = new dbx.Dropbox({
            clientId,
            fetch
        } as any);
        const authUrl = dropbox.getAuthenticationUrl(returnUrl);
        window.location.href = authUrl;
    }

    isLoggedIn() {
        return !!this.accessToken;
    }

    setToken(accesstoken: string) {
        this.accessToken = accesstoken;
    }

    getList() {
        return this.dbx.filesListFolder({ path: '' });
    }

    async getLatest() {
        if (!this.latestCursor) {
            const cursor = await this.dbx.filesListFolderGetLatestCursor({
                path: '',
                include_deleted: true,
                include_media_info: true
            });
            this.latestCursor = cursor.cursor;
        }
        const result = await this.dbx.filesListFolderContinue({
            cursor: this.latestCursor
        });
        this.latestCursor = result.cursor; // move to next, do not do if you need to repeat the call
        return result;
    }

    async pushEntry(entry: Entry) {
        this.dbx.filesUpload({
            client_modified: toDropboxString(entry.modified),
            contents: JSON.stringify(entry),
            path: `/${entry.id}.json`,
            mode: { '.tag': 'overwrite' }
        });
    }

    pushEntries(entries: Entry[]) {
        return new Promise((resolve, reject) => {
            forkJoin(
                entries.map(entry => {
                    const contents = JSON.stringify(entry);
                    return from(
                        this.dbx.filesUploadSessionStart({
                            contents,
                            close: true
                        })
                    ).pipe(
                        map(session => ({
                            cursor: {
                                session_id: session.session_id,
                                offset: contents.length
                            },
                            commit: {
                                path: `/${entry.id}.json`,
                                mode: 'add',
                                mute: false
                            }
                        }))
                    );
                })
            )
                .pipe(
                    switchMap((sessions: any) =>
                        this.dbx.filesUploadSessionFinishBatch({
                            entries: sessions
                        })
                    )
                )
                .subscribe(async job => {
                    await this.waitForUpload(job);
                    resolve();
                });
        });
    }

    private waitForUpload(
        job:
            | dbx.files.UploadSessionFinishBatchLaunch
            | dbx.files.UploadSessionFinishBatchJobStatus
    ): Promise<void> {
        if (job['.tag'] === 'complete') {
            return Promise.resolve();
        } else if (job['.tag'] === 'async_job_id') {
            return new Promise(resolve => {
                setTimeout(async () => {
                    const result = await this.dbx.filesUploadSessionFinishBatchCheck(
                        {
                            async_job_id: job.async_job_id
                        }
                    );
                    await this.waitForUpload(result);
                    resolve();
                }, 1000);
            });
        } else {
            return Promise.reject();
        }
    }
}

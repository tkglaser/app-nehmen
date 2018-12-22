import { Injectable } from '@angular/core';
import * as dbx from 'dropbox';
import * as fetch from 'isomorphic-fetch';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Entry } from '../models/entry.model';
import { forkJoin, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { blobToString, toDropboxString, httpHeaderSafeJSON } from '../utils';

const clientId = '988bai9urdqlw6l';

export type dbxFileRef =
    | dbx.files.FileMetadataReference
    | dbx.files.FolderMetadataReference
    | dbx.files.DeletedMetadataReference;

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

    async getList() {
        let entries: dbxFileRef[];
        const initialResult = await this.dbx.filesListFolder({ path: '' });
        entries = initialResult.entries;
        let hasMore = initialResult.has_more;
        let cursor = initialResult.cursor;
        while (hasMore) {
            const next = await this.dbx.filesListFolderContinue({
                cursor
            });
            entries = entries.concat(next.entries);
            cursor = next.cursor;
            hasMore = next.has_more;
        }
        return entries;
    }

    async download<T>(fileName: string): Promise<T> {
        const file = await this.dbx.filesDownload({
            path: fileName
        });
        const blob: Blob = (file as any).fileBlob;
        return JSON.parse(await blobToString(blob));
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
            contents: httpHeaderSafeJSON(entry),
            path: `/${entry.id}.json`,
            mode: { '.tag': 'overwrite' }
        });
    }

    pushEntries(entries: Entry[]) {
        return new Promise((resolve) => {
            forkJoin(
                entries.map(entry => {
                    const contents = httpHeaderSafeJSON(entry);
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
                                client_modified: toDropboxString(
                                    entry.modified
                                ),
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
                    await this.waitForUploadFinished(job);
                    resolve();
                });
        });
    }

    private async waitForUploadFinished(
        job: dbx.files.UploadSessionFinishBatchLaunch
    ): Promise<void> {
        if (job['.tag'] === 'complete') {
            return Promise.resolve();
        } else if (job['.tag'] === 'async_job_id') {
            await this.waitForUploadJob(job.async_job_id);
        } else {
            return Promise.reject();
        }
    }

    private async waitForUploadJob(jobId: string) {
        let isDone = false;
        do {
            await this.wait(1000);
            const check = await this.dbx.filesUploadSessionFinishBatchCheck({
                async_job_id: jobId
            });
            isDone = check['.tag'] === 'complete';
        } while (!isDone);
    }

    private wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

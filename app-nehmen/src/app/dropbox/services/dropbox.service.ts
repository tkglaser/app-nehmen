import { Injectable } from '@angular/core';
import * as dbx from 'dropbox';
import * as fetch from 'isomorphic-fetch';
import { Location } from '@angular/common';
import { forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { DB } from 'idb';

import { Entry, SyncState } from '../../models';
import {
    blobToString,
    toDropboxString,
    httpHeaderSafeJSON,
    wait,
    fromDropboxString
} from '../../utils';
import {
    countUnsyncedEntries,
    db,
    getUnsyncedEntriesPage,
    getEntryById,
    upsertEntry,
    removeEntry,
    getSetting,
    setSetting
} from 'src/app/db';
import { DropboxState, DropboxSyncState } from '../models';
import { EntryService } from 'src/app/services';

const clientId = '988bai9urdqlw6l';

function toDropboxModel(entry: Entry): string {
    const result = { ...entry };
    delete result.sync_state;
    return httpHeaderSafeJSON(result);
}

function loadState(dbPromise: Promise<DB>) {
    return getSetting<DropboxState>(dbPromise, 'dropbox_state', {
        accessToken: '',
        changesCursor: '',
        message: '',
        sync_state: DropboxSyncState.Success
    });
}

function saveState(dbPromise: Promise<DB>, state: DropboxState) {
    return setSetting(dbPromise, 'dropbox_state', state);
}

export type dbxFileRef =
    | dbx.files.FileMetadataReference
    | dbx.files.FolderMetadataReference
    | dbx.files.DeletedMetadataReference;

@Injectable({
    providedIn: 'root'
})
export class DropboxService {
    private state: DropboxState;
    private dbx: dbx.Dropbox;
    private isLoaded: Promise<void>;
    private timeoutHandle = null;

    constructor(
        private location: Location,
        private entriesService: EntryService
    ) {
        this.init();
    }

    private init() {
        this.isLoaded = new Promise(async resolve => {
            this.state = await loadState(db);
            resolve();
            if (this.state.accessToken) {
                this.login(this.state.accessToken);
            }
        });
    }

    async isLoggedIn() {
        await this.isLoaded;
        return !!(this.state && this.state.accessToken);
    }

    setPeriodicSync(on: boolean) {
        let syncInProgress = false;
        if (this.timeoutHandle != null) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
        if (on) {
            this.timeoutHandle = setInterval(async () => {
                if (!syncInProgress) {
                    syncInProgress = true;
                    await this.syncDownToLocal();
                    await this.syncUpToCloud();
                    await this.entriesService.loadToday();
                    syncInProgress = false;
                }
            }, 30000);
        }
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
        this.dbx = new dbx.Dropbox({
            accessToken: this.state.accessToken,
            fetch
        } as any);
        return saveState(db, this.state);
    }

    logout() {
        this.state.accessToken = '';
        this.state.changesCursor = '';
        this.dbx = null;
        return saveState(db, this.state);
    }

    async syncDownToLocal() {
        let entries: dbxFileRef[];
        let nextCursor: string;
        if (!this.state.changesCursor) {
            entries = await this.getFullList();
            const cursor = await this.dbx.filesListFolderGetLatestCursor({
                path: '',
                include_deleted: true,
                include_media_info: true
            });
            nextCursor = cursor.cursor;
        } else {
            const next = await this.dbx.filesListFolderContinue({
                cursor: this.state.changesCursor
            });
            entries = next.entries;
            nextCursor = next.cursor;
        }

        console.log('ENTRIES TO SYNC DOWN', entries);
        for (const entry of entries) {
            await this.localSync(entry);
        }
        this.state.changesCursor = nextCursor;
        await saveState(db, this.state);
    }

    private async localSync(fileRef: dbxFileRef) {
        const id = fileRef.name.replace('.json', '');
        let sync_decision:
            | 'take_remote'
            | 'take_remote_if_newer'
            | 'delete_local'
            | 'take_local';

        // get local
        const localEntry = await getEntryById(db, id);
        if (!localEntry) {
            // file is not present on local
            if (fileRef['.tag'] === 'deleted') {
                // deleted remote and local. We're good.
                sync_decision = 'take_local';
            } else if (fileRef['.tag'] === 'file') {
                // created remote => create local
                sync_decision = 'take_remote';
            }
        } else {
            // entry is present locally
            if (fileRef['.tag'] === 'deleted') {
                // deleted remote => delete local.
                sync_decision = 'delete_local';
            } else if (fileRef['.tag'] === 'file') {
                // changed remotely and present locally
                if (localEntry.sync_state === SyncState.Synced) {
                    // clean on local => copy down
                    sync_decision = 'take_remote';
                } else if (localEntry.sync_state === SyncState.Dirty) {
                    // changed remote and locally dirty => decide by mod timestamp
                    sync_decision = 'take_remote_if_newer';
                } else if (localEntry.sync_state === SyncState.Deleted) {
                    // changed remote, deleted local => take remote, just in case.
                    sync_decision = 'take_remote';
                }
            }
        }

        if (sync_decision === 'delete_local') {
            await removeEntry(db, id);
        } else if (sync_decision === 'take_remote') {
            const entry = await this.download<Entry>(fileRef.path_lower);
            await upsertEntry(db, {
                ...entry,
                sync_state: SyncState.Synced
            });
        } else if (sync_decision === 'take_remote_if_newer') {
            const entry = await this.download<Entry>(fileRef.path_lower);
            if (entry.modified > localEntry.modified) {
                await upsertEntry(db, {
                    ...entry,
                    sync_state: SyncState.Synced
                });
            }
        }
    }

    private async getFullList() {
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

    private async download<T>(path: string): Promise<T> {
        const file = await this.dbx.filesDownload({
            path
        });
        const blob: Blob = (file as any).fileBlob;
        return JSON.parse(await blobToString(blob));
    }

    async syncUpToCloud() {
        const total = await countUnsyncedEntries(db);
        if (total < 1) {
            return;
        }
        let hasMore: boolean;
        let page = 0;
        do {
            const entries = await getUnsyncedEntriesPage(db, 10, page++);
            hasMore = entries.hasMore;
            console.log('ENTRIES TO SYNC UP', entries);
            const itemsToCopy = entries.items.filter(
                entry => entry.sync_state === SyncState.Dirty
            );
            if (itemsToCopy.length) {
                const apiResults = await this.copyToCloud(itemsToCopy);
                await this.localClearDirty(apiResults);
            }
            const itemsToDelete = entries.items.filter(
                entry => entry.sync_state === SyncState.Deleted
            );
            if (itemsToDelete.length) {
                const apiResults = await this.deleteOnCloud(itemsToDelete);
                await this.localDelete(itemsToDelete, apiResults);
            }
        } while (hasMore);
    }

    private async copyToCloud(entries: Entry[]) {
        const uploads: any[] = await forkJoin(
            entries.map(entry => {
                const contents = toDropboxModel(entry);
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
                            client_modified: toDropboxString(entry.modified),
                            mode: 'overwrite',
                            mute: false
                        }
                    }))
                );
            })
        ).toPromise();

        let job:
            | dbx.files.UploadSessionFinishBatchLaunch
            | dbx.files.UploadSessionFinishBatchJobStatus = await this.dbx.filesUploadSessionFinishBatch(
            {
                entries: uploads
            }
        );

        let jobId: string;

        while (
            job['.tag'] === 'async_job_id' ||
            job['.tag'] === 'in_progress'
        ) {
            if (job['.tag'] === 'async_job_id') {
                jobId = job.async_job_id;
            }
            await wait(1000);
            job = await this.dbx.filesUploadSessionFinishBatchCheck({
                async_job_id: jobId
            });
        }

        if (job['.tag'] === 'complete') {
            return job.entries;
        } else {
            return Promise.reject(job);
        }
    }

    private async deleteOnCloud(entries: Entry[]) {
        let job:
            | dbx.files.DeleteBatchLaunch
            | dbx.files.DeleteBatchJobStatus = await this.dbx.filesDeleteBatch({
            entries: entries.map(entry => ({
                path: `/${entry.id}.json`
            }))
        });

        while (job['.tag'] === 'async_job_id') {
            await wait(1000);
            job = await this.dbx.filesDeleteBatchCheck({
                async_job_id: job.async_job_id
            });
        }

        if (job['.tag'] === 'complete') {
            return job.entries;
        } else {
            return Promise.reject(job);
        }
    }

    private async localClearDirty(
        pushResults: Array<dbx.files.UploadSessionFinishBatchResultEntry>
    ) {
        for (const pushResult of pushResults) {
            if (pushResult['.tag'] === 'success') {
                const id = pushResult.name.replace('.json', '');
                const entry = await getEntryById(db, id);
                if (entry) {
                    const patch = {
                        ...entry,
                        sync_state: SyncState.Synced,
                        modified: fromDropboxString(pushResult.server_modified)
                    };
                    await upsertEntry(db, patch);
                }
            }
        }
    }

    private async localDelete(
        entries: Entry[],
        pushResults: Array<dbx.files.DeleteBatchResultEntry>
    ) {
        for (let i = 0; i < entries.length; ++i) {
            const pushResult = pushResults[i];
            const entry = entries[i];
            let canDelete = false;
            if (pushResult['.tag'] === 'success') {
                canDelete = true;
            } else if (
                pushResult['.tag'] === 'failure' &&
                pushResult.failure['.tag'] === 'path_lookup' &&
                pushResult.failure.path_lookup['.tag'] === 'not_found'
            ) {
                // not found on remote is fine, deleting local as well
                canDelete = true;
            }
            if (canDelete) {
                await removeEntry(db, entry.id);
            }
        }
    }
}

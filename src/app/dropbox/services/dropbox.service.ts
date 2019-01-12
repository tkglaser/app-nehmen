import * as dbx from 'dropbox';
import * as fetch from 'isomorphic-fetch';
import { forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { DB } from 'idb';

import { Entry, SyncState } from '../../models';
import { DropboxState, DropboxSyncState } from '../models';
import { httpHeaderSafeJSON } from '../../utils/json.utils';
import { blobToString } from '../../utils/blob.utils';
import {
    toDropboxString,
    fromDropboxString,
    dayString
} from '../../utils/date.utils';
import { wait } from '../../utils/async.utils';
import { getSetting, setSetting } from '../../db/settings-store';
import { db } from '../../db/index-db';
import {
    getEntryById,
    removeEntry,
    upsertEntry,
    countUnsyncedEntries,
    getUnsyncedEntriesPage
} from '../../db/calory-store';
import { DropboxEntry } from '../models/dropbox-entry.model';
import { log } from '../../db/sync-log-store';

function toDropboxModel(entry: Entry): string {
    const result: DropboxEntry = {
        calories: entry.calories,
        created: entry.created,
        description: entry.description,
        exercise: entry.exercise,
        modified: entry.modified
    };
    return httpHeaderSafeJSON(result);
}

export function loadState(dbPromise: Promise<DB>) {
    return getSetting<DropboxState>(dbPromise, 'dropbox_state', {
        accessToken: '',
        changesCursor: '',
        message: '',
        sync_state: DropboxSyncState.Success
    });
}

export function saveState(dbPromise: Promise<DB>, state: DropboxState) {
    return setSetting(dbPromise, 'dropbox_state', state);
}

type dbxFileRef =
    | dbx.files.FileMetadataReference
    | dbx.files.FolderMetadataReference
    | dbx.files.DeletedMetadataReference;

export class DropboxService {
    private state: DropboxState;
    private dbx: dbx.Dropbox;

    private constructor() {}

    static async create() {
        const inst = new DropboxService();
        await inst.init();
        return inst;
    }

    private async init() {
        this.state = await loadState(db);
        if (this.state.accessToken) {
            this.dbx = new dbx.Dropbox({
                accessToken: this.state.accessToken,
                fetch
            } as any);
            return saveState(db, this.state);
        }
    }

    isLoggedIn() {
        return !!this.state.accessToken;
    }

    private async log(message: string) {
        await log(db, message);
    }

    async syncDownToLocal() {
        let entries: dbxFileRef[];
        let nextCursor: string;
        if (!this.state.changesCursor) {
            await this.log('no delta information, running full sync');
            entries = await this.getFullList();
            const cursor = await this.dbx.filesListFolderGetLatestCursor({
                path: '',
                include_deleted: true,
                include_media_info: true
            });
            nextCursor = cursor.cursor;
        } else {
            await this.log('using delta information');
            const next = await this.dbx.filesListFolderContinue({
                cursor: this.state.changesCursor
            });
            entries = next.entries;
            nextCursor = next.cursor;
        }

        for (const entry of entries) {
            await this.log(`downloading entry "${entry.name}"`);
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
            | 'take_local' = 'take_local';

        // get local
        const localEntry = await getEntryById(db, id);
        if (!localEntry) {
            await this.log(`file is not present on local`);
            if (fileRef['.tag'] === 'deleted') {
                await this.log(`deleted remote and local. We're good.`);
                sync_decision = 'take_local';
            } else if (fileRef['.tag'] === 'file') {
                await this.log(`created remote => create local`);
                sync_decision = 'take_remote';
            }
        } else {
            await this.log(`entry is present locally`);
            if (fileRef['.tag'] === 'deleted') {
                await this.log(`deleted remote => delete local.`);
                sync_decision = 'delete_local';
            } else if (fileRef['.tag'] === 'file') {
                await this.log(`changed remotely and present locally`);
                if (localEntry.sync_state === SyncState.Synced) {
                    await this.log(`clean on local => copy down`);
                    sync_decision = 'take_remote';
                } else if (localEntry.sync_state === SyncState.Dirty) {
                    await log(
                        db,
                        `changed remote and locally dirty => decide by mod timestamp`
                    );
                    sync_decision = 'take_remote_if_newer';
                } else if (localEntry.sync_state === SyncState.Deleted) {
                    await log(
                        db,
                        `changed remote, deleted local => take remote, just in case.`
                    );
                    sync_decision = 'take_remote';
                }
            }
        }

        if (sync_decision === 'delete_local') {
            await removeEntry(db, id);
        } else if (sync_decision === 'take_remote') {
            const entry = await this.download(fileRef.path_lower || '');
            await upsertEntry(db, {
                ...entry,
                id,
                day: dayString(entry.created),
                sync_state: SyncState.Synced
            });
        } else if (sync_decision === 'take_remote_if_newer') {
            const entry = await this.download(fileRef.path_lower || '');
            if (entry.modified > localEntry.modified) {
                await upsertEntry(db, {
                    ...entry,
                    id,
                    day: dayString(entry.created),
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

    private async download(path: string): Promise<DropboxEntry> {
        const file = await this.dbx.filesDownload({
            path
        });
        const blob: Blob = (file as any).fileBlob;
        return JSON.parse(await blobToString(blob));
    }

    async syncUpToCloud(): Promise<boolean> {
        const total = await countUnsyncedEntries(db);
        if (total < 1) {
            await this.log('nothing to sync up');
            return false;
        }
        await this.log(`${total} entries to sync up`);
        let hasMore: boolean;
        let page = 0;
        do {
            const entries = await getUnsyncedEntriesPage(db, 10, page++);
            hasMore = entries.hasMore;
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

        // forget the set of changes we just made
        const next = await this.dbx.filesListFolderContinue({
            cursor: this.state.changesCursor
        });
        this.state.changesCursor = next.cursor;
        await saveState(db, this.state);

        await this.log('finished syncing up');
        return true;
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

        let jobId = '';

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

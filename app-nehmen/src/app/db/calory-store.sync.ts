import { DB } from 'idb';

import { caloryEntriesStore, calorySyncStateIndex } from './mini-db';
import { take, skip } from './utils';
import { Entry, SyncState, Pager } from '../models';

export async function countUnsyncedEntries(dbPromise: Promise<DB>) {
    const db = await dbPromise;

    return await db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .index(calorySyncStateIndex)
        .count(
            IDBKeyRange.bound(SyncState.Dirty, SyncState.Deleted, false, false)
        );
}

export async function getUnsyncedEntriesPage(
    dbPromise: Promise<DB>,
    pageSize: number,
    page: number
): Promise<Pager<Entry>> {
    const db = await dbPromise;

    const entries = await db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .index(calorySyncStateIndex)
        .openCursor(
            IDBKeyRange.bound(SyncState.Dirty, SyncState.Deleted, false, false)
        );

    const result: Entry[] = [];

    await skip<Entry>(entries, pageSize * page);
    await take<Entry>(entries, pageSize + 1, entry => result.push(entry));
    return {
        items: result.slice(0, pageSize),
        hasMore: result.length > pageSize
    };
}

import { DB } from 'idb';

import {
    caloryEntriesStore,
    caloryEntriesByDayIndex,
    caloryEntriesByTimestampIndex,
    calorySyncStateIndex
} from './index-db';
import { take, skip } from './utils';
import { Entry, AutoSuggestion, Pager, SyncState } from '../models';

export async function upsertEntry(dbPromise: Promise<DB>, entry: Entry) {
    const db = await dbPromise;
    const tx = db.transaction(caloryEntriesStore, 'readwrite');
    tx.objectStore<Entry>(caloryEntriesStore).put(entry);
    return tx.complete;
}

export async function removeEntry(dbPromise: Promise<DB>, key: string) {
    const db = await dbPromise;
    const tx = db.transaction(caloryEntriesStore, 'readwrite');
    tx.objectStore<Entry>(caloryEntriesStore).delete(key);
    return tx.complete;
}

export async function getEntryById(dbPromise: Promise<DB>, key: string) {
    const db = await dbPromise;
    return db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .get(key);
}

export async function getEntriesByDay(dbPromise: Promise<DB>, date: string) {
    const db = await dbPromise;
    const result = await db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .index(caloryEntriesByDayIndex)
        .getAll(IDBKeyRange.only(date));
    return result.filter(entry => entry.sync_state !== SyncState.Deleted);
}

export async function hasEntriesOlderThan(
    dbPromise: Promise<DB>,
    date: string
) {
    const db = await dbPromise;
    const count = await db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .index(caloryEntriesByDayIndex)
        .count(IDBKeyRange.upperBound(date, true));
    return count > 0;
}

export async function getAutoSuggestionEntries(
    dbPromise: Promise<DB>,
    search: string
) {
    function groupKey(e: Entry): string {
        return `${e.description}#${e.calories}`;
    }
    const searchLower = search.toLowerCase();

    const result = new Map<string, AutoSuggestion>();

    const db = await dbPromise;

    const allEntries = await db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .index(caloryEntriesByTimestampIndex)
        .openCursor(null, 'prev');

    await take<Entry>(allEntries, 1000, entry => {
        if ((entry.description || '').toLowerCase().includes(searchLower)) {
            if (!result.has(groupKey(entry))) {
                result.set(groupKey(entry), {
                    calories: entry.calories,
                    description: entry.description,
                    exercise: entry.exercise,
                    frequency: 1
                });
            } else {
                const group = result.get(groupKey(entry));
                if (group) {
                    group.frequency++;
                }
            }
        }
    });
    return Array.from(result.values());
}

export async function countEntries(dbPromise: Promise<DB>) {
    const db = await dbPromise;

    return await db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .count();
}

export async function getEntriesPage(
    dbPromise: Promise<DB>,
    pageSize: number,
    page: number
): Promise<Pager<Entry>> {
    const db = await dbPromise;

    const entries = await db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .index(caloryEntriesByTimestampIndex)
        .openCursor(null, 'prev');

    const result: Entry[] = [];

    await skip<Entry>(entries, pageSize * page);
    await take<Entry>(entries, pageSize + 1, entry => result.push(entry));
    return {
        items: result.slice(0, pageSize),
        hasMore: result.length > pageSize
    };
}

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

import { DB, Cursor } from 'idb';

import { Entry } from '../models/entry.model';
import { caloryEntriesStore, caloryEntriesByDayIndex } from './index-db';
import { dayString } from '../utils/date.utils';
import { forEach } from './utils';
import { AutoSuggestion } from '../models/auto-suggestion.model';

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

export async function getAllEntries(dbPromise: Promise<DB>) {
    const db = await dbPromise;
    return db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .getAll();
}

export async function getEntryByDay(dbPromise: Promise<DB>, date: string) {
    const db = await dbPromise;
    return db
        .transaction(caloryEntriesStore)
        .objectStore<Entry>(caloryEntriesStore)
        .index(caloryEntriesByDayIndex)
        .getAll(IDBKeyRange.only(date));
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
    console.log(date, count);
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
        .openCursor();

    await forEach<Entry>(allEntries, entry => {
        if ((entry.description || '').toLowerCase().includes(searchLower)) {
            if (!result.has(groupKey(entry))) {
                result.set(groupKey(entry), {
                    calories: entry.calories,
                    description: entry.description,
                    exercise: entry.exercise,
                    frequency: 1
                });
            } else {
                result.get(groupKey(entry)).frequency++;
            }
        }
    });
    return Array.from(result.values());
}

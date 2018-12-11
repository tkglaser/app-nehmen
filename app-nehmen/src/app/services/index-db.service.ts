import idb from 'idb';
import { Entry } from '../models/entry.model';
import { dayString } from '../utils/date.utils';

const caloryEntries = 'calory_entries';
const settings = 'settings';

const caloryEntriesByDayIndex = 'by_day';

const dbPromise = idb.open('app-nehmen-calorie-counter', 2, upgradeDB => {
    if (upgradeDB.oldVersion < 1) {
        upgradeDB.createObjectStore(settings);
        upgradeDB.createObjectStore(caloryEntries, { keyPath: 'id' });
    }
    if (upgradeDB.oldVersion < 2) {
        return new Promise(async resolve => {
            const entryStore = upgradeDB.transaction.objectStore<Entry>(
                caloryEntries
            );
            const allEntries = await entryStore.getAll();
            for (const entry of allEntries || []) {
                await entryStore.put({
                    ...entry,
                    day: dayString(entry.timestamp)
                });
            }
            entryStore.createIndex(caloryEntriesByDayIndex, 'day');
            resolve();
        });
    }
    if (upgradeDB.oldVersion < 3) {
        upgradeDB.transaction
            .objectStore<Entry>(caloryEntries)
            .createIndex('by_timestamp_desc', 'timestamp');
    }
});

async function searchEntries(predicate: (e: Entry) => boolean) {
    const result: Entry[] = [];
    const db = await dbPromise;
    let cursor = await db
        .transaction(caloryEntries)
        .objectStore<Entry>(caloryEntries)
        .openCursor();

    while (cursor) {
        if (predicate(cursor.value)) {
            result.push(cursor.value);
        }
        cursor = await cursor.continue();
    }
    return result;
}

export async function upsertEntry(entry: Entry) {
    const db = await dbPromise;
    const tx = db.transaction(caloryEntries, 'readwrite');
    tx.objectStore<Entry>(caloryEntries).put(entry);
    return tx.complete;
}

export async function removeEntry(key: string) {
    const db = await dbPromise;
    const tx = db.transaction(caloryEntries, 'readwrite');
    tx.objectStore<Entry>(caloryEntries).delete(key);
    return tx.complete;
}

export async function getAllEntries() {
    const db = await dbPromise;
    return db
        .transaction(caloryEntries)
        .objectStore<Entry>(caloryEntries)
        .getAll();
}

export async function getEntryByDay(date: Date) {
    const dateStr = dayString(date);
    const db = await dbPromise;
    return db
        .transaction(caloryEntries)
        .objectStore<Entry>(caloryEntries)
        .index(caloryEntriesByDayIndex)
        .getAll(IDBKeyRange.only(dateStr));
}

export async function getEntriesContaining(search: string) {
    const searchLower = (search || '').toLowerCase();
    return await searchEntries(entry =>
        entry.description.toLowerCase().includes(searchLower)
    );
}

export async function getEntryByDayOlderThan(
    date: Date,
    maxEntries: number = 100
) {
    const dateStr = dayString(date);
    const db = await dbPromise;
    return db
        .transaction(caloryEntries)
        .objectStore<Entry>(caloryEntries)
        .index(caloryEntriesByDayIndex)
        .getAll(IDBKeyRange.upperBound(dateStr, true), maxEntries);
}

export async function getSetting<T>(key: string, defaultValue: T) {
    const db = await dbPromise;
    return db
        .transaction(settings)
        .objectStore<T>(settings)
        .get(key)
        .then(v => v || defaultValue);
}

export async function setSetting(key, val) {
    const db = await dbPromise;
    const tx = db.transaction(settings, 'readwrite');
    tx.objectStore(settings).put(val, key);
    return tx.complete;
}

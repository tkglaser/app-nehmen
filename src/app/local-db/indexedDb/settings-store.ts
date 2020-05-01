import { DB } from 'idb';

import { settingsStore } from './index-db';

export async function getSetting<T>(
    dbPromise: Promise<DB>,
    key: string,
    defaultValue: T
) {
    const db = await dbPromise;
    const value = await db
        .transaction(settingsStore)
        .objectStore<T>(settingsStore)
        .get(key);
    return value || defaultValue;
}

export async function setSetting(
    dbPromise: Promise<DB>,
    key: string,
    val: any
) {
    const db = await dbPromise;
    const tx = db.transaction(settingsStore, 'readwrite');
    tx.objectStore(settingsStore).put(val, key);
    return tx.complete;
}

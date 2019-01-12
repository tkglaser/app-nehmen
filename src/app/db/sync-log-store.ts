import { DB } from 'idb';

import { syncLogStore } from './index-db';
import { SyncLogEntry } from '../models/sync-log-entry.model';

export async function log(dbPromise: Promise<DB>, message: string) {
    const db = await dbPromise;
    const tx = db.transaction(syncLogStore, 'readwrite');
    tx.objectStore<SyncLogEntry>(syncLogStore).put({
        message,
        timestamp: new Date().getTime()
    });
    return tx.complete;
}

export async function clear(dbPromise: Promise<DB>) {
    const db = await dbPromise;
    const tx = db.transaction(syncLogStore, 'readwrite');
    return tx.objectStore<SyncLogEntry>(syncLogStore).clear();
}

export async function getAll(dbPromise: Promise<DB>) {
    const db = await dbPromise;
    const tx = db.transaction(syncLogStore);
    return tx.objectStore<SyncLogEntry>(syncLogStore).getAll();
}

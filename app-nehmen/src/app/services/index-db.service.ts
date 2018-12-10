import { Injectable } from '@angular/core';
import idb from 'idb';
import { Entry } from '../models/entry.model';

const caloryEntries = 'calory_entries';
const settings = 'settings';

const dbPromise = idb.open('app-nehmen-calorie-counter', 1, upgradeDB => {
    upgradeDB.createObjectStore(settings);
    upgradeDB.createObjectStore(caloryEntries, { keyPath: 'id' });
});

@Injectable({
    providedIn: 'root'
})
export class IndexDbService {
    constructor() {}

    upsertEntry(entry: Entry) {
        return dbPromise.then(db => {
            const tx = db.transaction(caloryEntries, 'readwrite');
            tx.objectStore<Entry>(caloryEntries).put(entry);
            return tx.complete;
        });
    }

    removeEntry(key: string) {
        return dbPromise.then(db => {
            const tx = db.transaction(caloryEntries, 'readwrite');
            tx.objectStore<Entry>(caloryEntries).delete(key);
            return tx.complete;
        });
    }

    getAllEntries() {
        return dbPromise.then(db => {
            return db
                .transaction(caloryEntries)
                .objectStore<Entry>(caloryEntries)
                .getAll();
        });
    }

    getSetting<T>(key: string, defaultValue: T) {
        return dbPromise.then(db => {
            return db
                .transaction(settings)
                .objectStore<T>(settings)
                .get(key)
                .then(v => v || defaultValue);
        });
    }

    setSetting(key, val) {
        return dbPromise.then(db => {
            const tx = db.transaction(settings, 'readwrite');
            tx.objectStore(settings).put(val, key);
            return tx.complete;
        });
    }
}

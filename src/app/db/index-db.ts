import { openDb, UpgradeDB } from 'idb';

import { Entry, SyncState } from '../models';
import { dayString } from '../utils/date.utils';

export const caloryEntriesStore = 'calory_entries';
export const settingsStore = 'settings';
export const syncLogStore = 'sync_log';

export const caloryEntriesByDayIndex = 'by_day';
export const caloryEntriesByTimestampIndex = 'by_modified';
export const calorySyncStateIndex = 'by_sync_state';

export const db = openDb('app-nehmen-calorie-counter', 8, upgradeDB => {
    if (upgradeDB.oldVersion < 1) {
        upgradeV1(upgradeDB);
    }
    if (upgradeDB.oldVersion < 2) {
        upgradeV2(upgradeDB);
    }
    if (upgradeDB.oldVersion < 5) {
        upgradeV5(upgradeDB);
    }
    if (upgradeDB.oldVersion < 6) {
        upgradeV6(upgradeDB);
    }
    if (upgradeDB.oldVersion < 7) {
        upgradeV7(upgradeDB);
    }
    if (upgradeDB.oldVersion < 8) {
        upgradeV8(upgradeDB);
    }
});

function upgradeV1(upgradeDB: UpgradeDB) {
    upgradeDB.createObjectStore(settingsStore);
    upgradeDB.createObjectStore(caloryEntriesStore, { keyPath: 'id' });
}

async function upgradeV2(upgradeDB: UpgradeDB) {
    const entryStore = upgradeDB.transaction.objectStore(caloryEntriesStore);
    const allEntries = await entryStore.getAll();
    for (const entry of allEntries || []) {
        await entryStore.put({
            ...entry,
            day: dayString(entry.timestamp)
        });
    }
    entryStore.createIndex(caloryEntriesByDayIndex, 'day');
}

async function upgradeV5(upgradeDB: UpgradeDB) {
    const entryStore = upgradeDB.transaction.objectStore<Entry>(
        caloryEntriesStore
    );
    const allEntries = await entryStore.getAll();
    for (const entry of allEntries || []) {
        await entryStore.put({
            id: entry.id,
            calories: entry.calories,
            description: entry.description,
            day: entry.day,
            exercise: entry.exercise,
            created: (entry as any).timestamp,
            modified: (entry as any).timestamp
        } as any);
    }
}

function upgradeV6(upgradeDB: UpgradeDB) {
    if (
        upgradeDB.transaction
            .objectStore(caloryEntriesStore)
            .indexNames.contains('by_timestamp_desc')
    ) {
        upgradeDB.transaction
            .objectStore(caloryEntriesStore)
            .deleteIndex('by_timestamp_desc');
    }
    upgradeDB.transaction
        .objectStore(caloryEntriesStore)
        .createIndex(caloryEntriesByTimestampIndex, 'modified');
}

async function upgradeV7(upgradeDB: UpgradeDB) {
    const entryStore = upgradeDB.transaction.objectStore<Entry>(
        caloryEntriesStore
    );
    const allEntries = await entryStore.getAll();
    for (const entry of allEntries || []) {
        await entryStore.put({
            ...entry,
            sync_state: SyncState.Dirty
        });
    }
    entryStore.createIndex(calorySyncStateIndex, 'sync_state');
}

function upgradeV8(upgradeDB: UpgradeDB) {
    upgradeDB.createObjectStore(syncLogStore, {
        autoIncrement: true
    });
}

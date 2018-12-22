import { UpgradeDB } from 'idb';
import idb from 'idb';

import { dayString } from '../utils';
import { Entry } from '../models/entry.model';

export const caloryEntriesStore = 'calory_entries';
export const settingsStore = 'settings';

export const caloryEntriesByDayIndex = 'by_day';
export const caloryEntriesByTimestampIndex = 'by_modified';

export const db = idb.open('app-nehmen-calorie-counter', 6, upgradeDB => {
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
        });
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

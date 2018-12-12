import { UpgradeDB } from 'idb';
import idb from 'idb';

import { dayString } from '../utils/date.utils';

export const caloryEntriesStore = 'calory_entries';
export const settingsStore = 'settings';

export const caloryEntriesByDayIndex = 'by_day';
export const caloryEntriesByTimestampIndex = 'by_timestamp_desc';

export const db = idb.open('app-nehmen-calorie-counter', 3, upgradeDB => {
    if (upgradeDB.oldVersion < 1) {
        upgradeV1(upgradeDB);
    }
    if (upgradeDB.oldVersion < 2) {
        upgradeV2(upgradeDB);
    }
    if (upgradeDB.oldVersion < 3) {
        upgradeV3(upgradeDB);
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

function upgradeV3(upgradeDB: UpgradeDB) {
    upgradeDB.transaction
        .objectStore(caloryEntriesStore)
        .createIndex('by_timestamp_desc', 'timestamp');
}

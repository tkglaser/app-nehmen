importScripts('Dropbox-sdk.min.js');
importScripts('idb.js');

(function() {
    'use strict';

    const caloryEntriesStore = 'calory_entries';
    const settingsStore = 'settings';

    const caloryEntriesByDayIndex = 'by_day';
    const caloryEntriesByTimestampIndex = 'by_modified';
    const calorySyncStateIndex = 'by_sync_state';

    const db = idb.open('app-nehmen-calorie-counter', 7, () => {});

    async function countUnsyncedEntries(dbPromise) {
        const db = await dbPromise;

        return await db
            .transaction(caloryEntriesStore)
            .objectStore(caloryEntriesStore)
            .index(calorySyncStateIndex)
            .count(
                IDBKeyRange.bound(
                    1 /*SyncState.Dirty*/,
                    2 /*SyncState.Deleted*/,
                    false,
                    false
                )
            );
    }

    async function skip(cursor, skipItems) {
        if (skipItems) {
            await cursor.advance(skipItems);
        }
    }

    async function take(cursor, takeitems, callback) {
        let itemsLeft = takeitems;
        while (cursor && itemsLeft) {
            callback(cursor.value);
            --itemsLeft;
            cursor = await cursor.continue();
        }
    }

    async function getUnsyncedEntriesPage(dbPromise, pageSize, page) {
        const db = await dbPromise;

        const entries = await db
            .transaction(caloryEntriesStore)
            .objectStore(caloryEntriesStore)
            .index(calorySyncStateIndex)
            .openCursor(
                IDBKeyRange.bound(
                    1 /*SyncState.Dirty*/,
                    2 /*SyncState.Deleted*/,
                    false,
                    false
                )
            );

        const result = [];

        await skip(entries, pageSize * page);
        await take(entries, pageSize + 1, entry => result.push(entry));
        return {
            items: result.slice(0, pageSize),
            hasMore: result.length > pageSize
        };
    }

    async function runSync() {
        const count = await countUnsyncedEntries(db);
        const entries = await getUnsyncedEntriesPage(db, 10, 0);
        console.log(`FOUND ${count} ENTRIES TO SYNC `, entries);
    }

    self.addEventListener('sync', event => {
        event.waitUntil(runSync());
    });
})();

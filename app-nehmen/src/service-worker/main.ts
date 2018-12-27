import { db } from '../app/db/index-db';
import { countUnsyncedEntries } from '../app/db/calory-store';

const scope = (self as any) as ServiceWorkerGlobalScope;

async function doSync() {
    const count = await countUnsyncedEntries(db);
    console.log('THIS MANY TO SYNC ' + count);
}

scope.addEventListener('sync', event => {
    if (event) {
        event.waitUntil(doSync());
    }
});

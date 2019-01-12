import { DropboxService } from '../app/dropbox/services/dropbox.service';
import { log } from '../app/db/sync-log-store';
import { db } from '../app/db/index-db';

const scope = (self as any) as ServiceWorkerGlobalScope;

async function notifyClients() {
    const clients = await scope.clients.matchAll({ includeUncontrolled: true });
    for (const client of clients) {
        client.postMessage('sync_finished');
    }
}

async function doSync() {
    try {
        const dropboxService = await DropboxService.create();
        if (dropboxService.isLoggedIn()) {
            await log(db, 'SYNC STARTS');
            await dropboxService.syncDownToLocal();
            do {} while (await dropboxService.syncUpToCloud());
            await notifyClients();
            await log(db, 'SYNC ENDS');
        } else {
            await log(db, 'NOT LOGGED IN');
        }
    } catch (ex) {
        await log(db, `exception occurred ${JSON.parse(ex)}`);
    }
}

scope.addEventListener('sync', event => {
    if (event) {
        event.waitUntil(doSync());
    }
});

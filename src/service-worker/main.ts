import { db } from '../app/db/index-db';
import { log } from '../app/db/sync-log-store';
import { DropboxService } from '../app/dropbox/services/dropbox.service';

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
            await dropboxService.syncDownToLocal();
            do {} while (await dropboxService.syncUpToCloud());
            await notifyClients();
        }
    } catch (ex) {
        await log(db, `exception occurred ${JSON.stringify(ex)}`);
    }
}

scope.addEventListener('sync', event => {
    if (event) {
        event.waitUntil(doSync());
    }
});

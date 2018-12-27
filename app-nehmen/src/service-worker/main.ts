import { DropboxService } from '../app/dropbox/services/dropbox.service';

const scope = (self as any) as ServiceWorkerGlobalScope;

async function notifyClients() {
    const clients = await scope.clients.matchAll({ includeUncontrolled: true });
    for (const client of clients) {
        client.postMessage('sync_finished');
    }
}

async function doSync() {
    const dropboxService = await DropboxService.create();
    if (dropboxService.isLoggedIn()) {
        console.log('SYNC STARTS');
        await dropboxService.syncDownToLocal();
        await dropboxService.syncUpToCloud();
        await notifyClients();
        console.log('SYNC ENDS');
    } else {
        console.log('NOT LOGGED IN');
    }
}

scope.addEventListener('sync', event => {
    if (event) {
        event.waitUntil(doSync());
    }
});

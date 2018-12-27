import { DropboxService } from '../app/dropbox/services/dropbox.service';

const scope = (self as any) as ServiceWorkerGlobalScope;

async function doSync() {
    const dropboxService = await DropboxService.create();
    await dropboxService.syncDownToLocal();
    await dropboxService.syncUpToCloud();
}

scope.addEventListener('sync', event => {
    console.log(scope);
    if (event) {
        event.waitUntil(doSync());
    }
});

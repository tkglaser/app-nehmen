import { DropboxSyncState } from './dropbox-sync-state.model';

export interface DropboxState {
    accessToken: string;
    changesCursor: string;
    sync_state: DropboxSyncState;
    message: string;
}

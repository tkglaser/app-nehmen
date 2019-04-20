import { SyncState } from './sync-state.model';

export interface EntryModel {
    id: string;
    calories: number;
    description: string;
    day: string;
    exercise: boolean;
    created: number;
    modified: number;
    sync_state: SyncState;
}

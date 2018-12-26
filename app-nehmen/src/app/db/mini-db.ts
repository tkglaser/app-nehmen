import idb from 'idb';

export const caloryEntriesStore = 'calory_entries';
export const calorySyncStateIndex = 'by_sync_state';


export const dbNoUpgrade = idb.open('app-nehmen-calorie-counter', 7, () => {});

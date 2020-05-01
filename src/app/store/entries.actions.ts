import { createAction, props } from '@ngrx/store';

import { EntryAddModel, EntryModel, EntryUpdateModel } from '../models';

export const setAllEntries = createAction(
    '[Entries] Set All',
    props<{ entries: EntryModel[] }>()
);

export const addEntry = createAction(
    '[Entries] Add One',
    props<{ entry: EntryAddModel }>()
);

export const updateEntry = createAction(
    '[Entries] Update One',
    props<{ entryId: string; updates: EntryUpdateModel }>()
);

export const deleteEntry = createAction(
    '[Entries] Delete One',
    props<{ entryId: string }>()
);

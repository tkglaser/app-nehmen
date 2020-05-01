import { createAction, props } from '@ngrx/store';

import { EntryAddModel, EntryModel, EntryUpdateModel } from '../models';

export class SetAllEntries {
    static readonly type = '[Entries] Set All';
    constructor(public entries: EntryModel[]) {}
}

export class AddEntry {
    static readonly type = '[Entries] Add One';
    constructor(public entry: EntryAddModel) {}
}

export class UpdateEntry {
    static readonly type = '[Entries] Update One';
    constructor(public entryId: string, public updates: EntryUpdateModel) {}
}

export class DeleteEntry {
    static readonly type = '[Entries] Delete One';
    constructor(public entryId: string) {}
}

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

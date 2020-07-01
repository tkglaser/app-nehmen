import { createReducer, on, Action } from '@ngrx/store';

import { EntryModel, EntryAddModel, EntryUpdateModel } from '../models';
import * as EntriesActions from './entries.actions';
import { dayString } from '../utils';

export type State = EntryModel[];

export const initialState: State = [];

const entriesReducer = createReducer(
    initialState,
    on(EntriesActions.setAllEntries, (_, action) => action.entries || []),
    on(EntriesActions.addEntry, (state, { entry }) =>
        [...state, fromCreateModel(entry)].sort(byCreatedDateDescending)
    ),
    on(EntriesActions.updateEntry, (state, { entryId, updates }) =>
        state.map((entry) =>
            entry.id === entryId ? fromUpdateModel(entry, updates) : entry
        )
    ),
    on(EntriesActions.deleteEntry, (state, { entryId }) =>
        state.filter((entry) => entry.id !== entryId)
    )
);

export function reducer(state: State | undefined, action: Action) {
    return entriesReducer(state, action);
}

function fromCreateModel(entry: EntryAddModel): EntryModel {
    const now = new Date();
    return {
        calories: +entry.calories,
        description: entry.description,
        id: entry.id,
        created: now.getTime(),
        modified: now.getTime(),
        day: dayString(now),
        exercise: !!entry.exercise,
    };
}

function fromUpdateModel(
    existingEntry: EntryModel,
    updates: EntryUpdateModel
): EntryModel {
    return {
        ...existingEntry,
        modified: new Date().getTime(),
        calories: +updates.calories,
        description: updates.description,
        exercise: !!updates.exercise,
    };
}

function byCreatedDateDescending(a: EntryModel, b: EntryModel) {
    if (a.created > b.created) {
        return -1;
    } else if (a.created < b.created) {
        return 1;
    } else {
        return 0;
    }
}

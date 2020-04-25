import { Injectable } from '@angular/core';
import {
    Action,
    createSelector,
    NgxsOnInit,
    State,
    StateContext,
    Store,
} from '@ngxs/store';

import { db, getAllEntries, upsertEntry } from '../db';
import { DropboxAuthService } from '../dropbox/services/dropbox-auth.service';
import { AutoSuggestionModel, EntryModel, SyncState } from '../models';
import { UniqueIdService } from '../services';
import { dayString } from '../utils';
import {
    AddEntry,
    DeleteEntry,
    SetAllEntries,
    UpdateEntry,
} from './entries.actions';

function byCreatedDateDescending(a: EntryModel, b: EntryModel) {
    if (a.created > b.created) {
        return -1;
    } else if (a.created < b.created) {
        return 1;
    } else {
        return 0;
    }
}

const byFrequencyDescending = (
    a: AutoSuggestionModel,
    b: AutoSuggestionModel
) => {
    if (a.frequency < b.frequency) {
        return 1;
    } else if (a.frequency > b.frequency) {
        return -1;
    } else {
        return 0;
    }
};

@State<EntryModel[]>({
    name: 'entries',
    defaults: [],
})
@Injectable()
export class EntriesState implements NgxsOnInit {
    static entriesByDay(day: string) {
        return createSelector([EntriesState], (state: EntryModel[]) =>
            state.filter((entry) => entry.day === day)
        );
    }

    static entryById(id: string) {
        return createSelector([EntriesState], (state: EntryModel[]) =>
            state.find((entry) => entry.id === id)
        );
    }

    static hasEntriesOlderThan(day: string) {
        return createSelector([EntriesState], (state: EntryModel[]) =>
            state.some((entry) => entry.day <= day)
        );
    }

    static autoSuggestions(key: string) {
        return createSelector([EntriesState], (state: EntryModel[]) => {
            const groupKey = (e: EntryModel): string =>
                `${e.description}#${e.calories}`;

            if (!key || !key.length) {
                return [];
            }

            const searchLower = key.toLowerCase();
            const groupedMatches = state.reduce((result, entry) => {
                if (
                    (entry.description || '')
                        .toLowerCase()
                        .includes(searchLower)
                ) {
                    if (!result.has(groupKey(entry))) {
                        result.set(groupKey(entry), {
                            calories: entry.calories,
                            description: entry.description,
                            exercise: entry.exercise,
                            frequency: 1,
                        });
                    } else {
                        const group = result.get(groupKey(entry));
                        if (group) {
                            group.frequency++;
                        }
                    }
                }
                return result;
            }, new Map<string, AutoSuggestionModel>());

            return Array.from(groupedMatches.values())
                .sort(byFrequencyDescending)
                .slice(0, 4);
        });
    }

    constructor(
        private dropbox: DropboxAuthService,
        private store: Store,
        private uuid: UniqueIdService
    ) {}

    async ngxsOnInit(ctx: StateContext<EntryModel[]>) {
        const entries = await getAllEntries(db);
        ctx.setState(entries.sort(byCreatedDateDescending));
        this.dropbox
            .onSyncFinished()
            .subscribe(() => this.loadAllFromStorage());
        this.dropbox.scheduleSync();
    }

    private async loadAllFromStorage() {
        const entries = await getAllEntries(db);
        this.store.dispatch(new SetAllEntries(entries));
    }

    @Action(SetAllEntries)
    setAllEntries(ctx: StateContext<EntryModel[]>, action: SetAllEntries) {
        ctx.setState((action.entries || []).sort(byCreatedDateDescending));
    }

    @Action(AddEntry)
    async addEntry(ctx: StateContext<EntryModel[]>, action: AddEntry) {
        const state = ctx.getState();
        const now = new Date();
        const newEntry: EntryModel = {
            calories: +action.entry.calories,
            description: action.entry.description,
            id: this.nextId(),
            created: now.getTime(),
            modified: now.getTime(),
            day: dayString(now),
            exercise: !!action.entry.exercise,
            sync_state: SyncState.Dirty,
        };
        ctx.setState([...state, newEntry].sort(byCreatedDateDescending));
        await upsertEntry(db, newEntry);
        this.dropbox.scheduleSync();
    }

    @Action(UpdateEntry)
    async updateEntry(ctx: StateContext<EntryModel[]>, action: UpdateEntry) {
        const state = ctx.getState();
        const existingEntry = state.find(
            (entry) => entry.id === action.entryId
        );
        if (!existingEntry) {
            return;
        }
        const updatedEntry = {
            ...existingEntry,
            modified: new Date().getTime(),
            sync_state: SyncState.Dirty,
            calories: +action.updates.calories,
            description: action.updates.description,
            exercise: !!action.updates.exercise,
        };
        ctx.setState(
            state.map((entry) =>
                entry.id === action.entryId ? updatedEntry : entry
            )
        );
        await upsertEntry(db, updatedEntry);
        this.dropbox.scheduleSync();
    }

    @Action(DeleteEntry)
    async deleteEntry(ctx: StateContext<EntryModel[]>, action: DeleteEntry) {
        const state = ctx.getState();
        const existingEntry = state.find(
            (entry) => entry.id === action.entryId
        );
        if (!existingEntry) {
            return;
        }
        ctx.setState(state.filter((entry) => entry.id !== action.entryId));
        await upsertEntry(db, {
            ...existingEntry,
            sync_state: SyncState.Deleted,
            modified: new Date().getTime(),
        });
        this.dropbox.scheduleSync();
    }

    private nextId() {
        return `${new Date().getTime()}${this.uuid.newGuid()}`;
    }
}

import {
    Action,
    createSelector,
    NgxsOnInit,
    State,
    StateContext
} from '@ngxs/store';

import { db, getAllEntries, upsertEntry } from '../db';
import { DropboxAuthService } from '../dropbox/services/dropbox-auth.service';
import { AutoSuggestion, EntryModel, SyncState } from '../models';
import { UniqueIdService } from '../services';
import { dayString } from '../utils';
import {
    AddEntry,
    DeleteEntry,
    SetAllEntries,
    UpdateEntry
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

const byFrequencyDescending = (a: AutoSuggestion, b: AutoSuggestion) => {
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
    defaults: []
})
export class EntriesState implements NgxsOnInit {
    static entriesByDay(day: string) {
        return createSelector(
            [EntriesState],
            (state: EntryModel[]) => state.filter(entry => entry.day === day)
        );
    }

    static entryById(id: string) {
        return createSelector(
            [EntriesState],
            (state: EntryModel[]) => state.find(entry => entry.id === id)
        );
    }

    static hasEntriesOlderThan(day: string) {
        return createSelector(
            [EntriesState],
            (state: EntryModel[]) => state.some(entry => entry.day <= day)
        );
    }

    static autoSuggestions(key: string) {
        return createSelector(
            [EntriesState],
            (state: EntryModel[]) => {
                const groupKey = (e: EntryModel): string =>
                    `${e.description}#${e.calories}`;
                const searchLower = key.toLowerCase();
                const result = new Map<string, AutoSuggestion>();

                if (!key || !key.length) {
                    return [];
                }

                state.forEach(entry => {
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
                                frequency: 1
                            });
                        } else {
                            const group = result.get(groupKey(entry));
                            if (group) {
                                group.frequency++;
                            }
                        }
                    }
                });
                return Array.from(result.values())
                    .sort(byFrequencyDescending)
                    .slice(0, 4);
            }
        );
    }

    async ngxsOnInit(ctx: StateContext<EntryModel[]>) {
        const entries = await getAllEntries(db);
        ctx.setState(entries.sort(byCreatedDateDescending));
    }

    constructor(
        private dropbox: DropboxAuthService,
        private uuid: UniqueIdService
    ) {}

    @Action(SetAllEntries)
    setAllEntries(ctx: StateContext<EntryModel[]>, action: SetAllEntries) {
        ctx.setState(action.entries);
    }

    @Action(AddEntry)
    addEntry(ctx: StateContext<EntryModel[]>, action: AddEntry) {
        const state = ctx.getState();
        const now = new Date();
        const newEntry: EntryModel = {
            calories: +action.entry.calories,
            description: action.entry.description,
            id: this.nextId(),
            created: now.getTime(),
            modified: now.getTime(),
            day: dayString(now),
            exercise: action.entry.exercise,
            sync_state: SyncState.Dirty
        };
        ctx.setState([...state, newEntry].sort(byCreatedDateDescending));
        upsertEntry(db, newEntry);
    }

    @Action(UpdateEntry)
    async updateEntry(ctx: StateContext<EntryModel[]>, action: UpdateEntry) {
        const state = ctx.getState();
        const existingEntry = state.find(entry => entry.id === action.entryId);
        if (!existingEntry) {
            return;
        }
        const updatedEntry = {
            ...existingEntry,
            modified: new Date().getTime(),
            sync_state: SyncState.Dirty,
            calories: +action.updates.calories,
            description: action.updates.description,
            exercise: action.updates.exercise
        };
        await upsertEntry(db, updatedEntry);
        await this.dropbox.scheduleSync();
        ctx.setState(
            state.map(entry =>
                entry.id === action.entryId ? updatedEntry : entry
            )
        );
    }

    @Action(DeleteEntry)
    async deleteEntry(ctx: StateContext<EntryModel[]>, action: DeleteEntry) {
        const state = ctx.getState();
        const existingEntry = state.find(entry => entry.id === action.entryId);
        if (!existingEntry) {
            return;
        }
        await upsertEntry(db, {
            ...existingEntry,
            sync_state: SyncState.Deleted,
            modified: new Date().getTime()
        });
        await this.dropbox.scheduleSync();
        ctx.setState(state.filter(entry => entry.id !== action.entryId));
    }

    private nextId() {
        return `${new Date().getTime()}${this.uuid.newGuid()}`;
    }
}

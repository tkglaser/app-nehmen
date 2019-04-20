import {
    Action,
    createSelector,
    NgxsOnInit,
    State,
    StateContext
} from '@ngxs/store';

import { db, getAllEntries } from '../db';
import { Entry } from '../models';
import { AddEntry, DeleteEntry, SetAllEntries } from './entries.actions';

function byCreatedDateDescending(a: Entry, b: Entry) {
    if (a.created > b.created) {
        return -1;
    } else if (a.created < b.created) {
        return 1;
    } else {
        return 0;
    }
}

@State<Entry[]>({
    name: 'entries',
    defaults: []
})
export class EntriesState implements NgxsOnInit {
    static entriesByDay(day: string) {
        return createSelector(
            [EntriesState],
            (state: Entry[]) => state.filter(entry => entry.day === day)
        );
    }

    static hasEntriesOlderThan(day: string) {
        return createSelector(
            [EntriesState],
            (state: Entry[]) => state.some(entry => entry.day <= day)
        );
    }

    async ngxsOnInit(ctx: StateContext<Entry[]>) {
        const entries = await getAllEntries(db);
        ctx.setState(entries.sort(byCreatedDateDescending));
    }

    @Action(SetAllEntries)
    setAllEntries(ctx: StateContext<Entry[]>, action: SetAllEntries) {
        ctx.setState(action.entries);
    }

    @Action(AddEntry)
    addEntry(ctx: StateContext<Entry[]>, action: AddEntry) {
        const state = ctx.getState();
        ctx.setState([...state, action.entry]);
    }

    @Action(DeleteEntry)
    deleteEntry(ctx: StateContext<Entry[]>, action: DeleteEntry) {
        const state = ctx.getState();
        ctx.setState(state.filter(entry => entry.id !== action.entryId));
    }
}

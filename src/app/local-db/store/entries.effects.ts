import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, startWith } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { db, getAllEntries, upsertEntry, softDeleteEntry } from '../indexedDb';
import * as EntriesActions from '../../store/entries.actions';
import { selectEntryById } from 'src/app/store';

@Injectable()
export class EntriesEffects {
    init$ = createEffect(() =>
        this.actions$.pipe(
            startWith({ type: 'BOOTSTRAP' }),
            ofType('BOOTSTRAP'),
            switchMap(() => getAllEntries(db)),
            map((entries) => EntriesActions.setAllEntries({ entries }))
        )
    );

    addEntry$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(EntriesActions.addEntry),
                switchMap((action) =>
                    this.store.select(selectEntryById(action.entry.id))
                ),
                switchMap((newEntry) => upsertEntry(db, newEntry))
            ),
        { dispatch: false }
    );

    updateEntry$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(EntriesActions.updateEntry),
                switchMap((action) =>
                    this.store.select(selectEntryById(action.entryId))
                ),
                switchMap((updatedEntry) => upsertEntry(db, updatedEntry))
            ),
        { dispatch: false }
    );

    deleteEntry$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(EntriesActions.deleteEntry),
                switchMap(({ entryId }) => softDeleteEntry(db, entryId))
            ),
        { dispatch: false }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly store: Store
    ) {}
}

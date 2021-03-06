import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as EntriesActions from '../../store/entries.actions';
import * as AuthActions from '../../authentication/store/auth.actions';
import { selectEntryById } from 'src/app/store';
import { CosmosDbService } from '../services/cosmos-db.service';

@Injectable()
export class EntriesEffects {
    init$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginComplete),
            switchMap(() => this.db.getAllEntries()),
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
                switchMap((newEntry) => this.db.upsertEntry(newEntry))
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
                switchMap((updatedEntry) => this.db.upsertEntry(updatedEntry))
            ),
        { dispatch: false }
    );

    deleteEntry$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(EntriesActions.deleteEntry),
                switchMap(({ entryId }) => this.db.deleteEntry(entryId))
            ),
        { dispatch: false }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly store: Store,
        private readonly db: CosmosDbService
    ) {}
}

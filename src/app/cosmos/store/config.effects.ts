import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs/operators';

import { CosmosDbService } from '../services/cosmos-db.service';
import * as ConfigActions from '../../store/config.actions';

@Injectable()
export class ConfigEffects {
    setConfig$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ConfigActions.setConfig),
                switchMap(({ config }) => this.db.setConfig(config))
            ),
        {
            dispatch: false,
        }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly db: CosmosDbService
    ) {}
}

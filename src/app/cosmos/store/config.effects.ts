import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map } from 'rxjs/operators';

import { CosmosDbService } from '../services/cosmos-db.service';
import * as ConfigActions from '../../store/config.actions';
import * as AuthActions from '../../authentication/store/auth.actions';

@Injectable()
export class ConfigEffects {
    init$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginComplete),
            switchMap(() => this.db.getConfig()),
            map((config) => ConfigActions.setConfig({ config }))
        )
    );

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

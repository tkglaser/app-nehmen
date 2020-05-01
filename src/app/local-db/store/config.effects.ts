import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, map, switchMap, startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import * as ConfigActions from '../../store/config.actions';
import { db, getSetting, setSetting } from '../indexedDb';
import { DayOfWeek } from '../../models';
import { initialState } from 'src/app/store/config.reducer';

const key_max_calories = 'max_calories';
const key_cheat_day = 'cheat_day';
const defaultValues = initialState;

@Injectable()
export class ConfigEffects {
    init$ = createEffect(() =>
        this.actions$.pipe(
            startWith({ type: 'BOOTSTRAP' }),
            ofType('BOOTSTRAP'),
            switchMap(() =>
                forkJoin([
                    getSetting<number>(
                        db,
                        key_max_calories,
                        defaultValues.maxCalories
                    ),
                    getSetting<DayOfWeek | 'none'>(
                        db,
                        key_cheat_day,
                        defaultValues.cheatDay
                    ),
                ])
            ),
            map(([maxCalories, cheatDay]) =>
                ConfigActions.setConfig({ config: { maxCalories, cheatDay } })
            )
        )
    );

    setConfig$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ConfigActions.setConfig),
                tap(async (action) => {
                    await setSetting(
                        db,
                        key_max_calories,
                        action.config.maxCalories
                    );
                    await setSetting(db, key_cheat_day, action.config.cheatDay);
                })
            ),
        {
            dispatch: false,
        }
    );

    constructor(private readonly actions$: Actions) {}
}

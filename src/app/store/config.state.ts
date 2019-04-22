import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';

import { db, getSetting, setSetting } from '../db';
import { ConfigModel, DayOfWeek } from '../models';
import { SetConfig } from './config.actions';

const key_max_calories = 'max_calories';
const key_cheat_day = 'cheat_day';
const defaultValues: ConfigModel = { maxCalories: 1700, cheatDay: 'none' };

@State<ConfigModel>({
    name: 'config',
    defaults: defaultValues
})
export class ConfigState implements NgxsOnInit {
    @Selector()
    static config(state: ConfigModel) {
        return state;
    }

    async ngxsOnInit(ctx: StateContext<any>) {
        const maxCalories = await getSetting<number>(
            db,
            key_max_calories,
            defaultValues.maxCalories
        );
        const cheatDay = await getSetting<DayOfWeek | 'none'>(
            db,
            key_cheat_day,
            defaultValues.cheatDay
        );
        ctx.setState({ maxCalories, cheatDay });
    }

    @Action(SetConfig)
    async setConfig(ctx: StateContext<any>, action: SetConfig) {
        ctx.setState(action.config);
        await setSetting(db, key_max_calories, action.config.maxCalories);
        await setSetting(db, key_cheat_day, action.config.cheatDay);
    }
}

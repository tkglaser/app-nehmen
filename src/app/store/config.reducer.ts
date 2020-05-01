import { createReducer, on, Action } from '@ngrx/store';

import { ConfigModel } from '../models';
import * as ConfigActions from './config.actions';

export type State = ConfigModel;

export const initialState: State = { maxCalories: 1700, cheatDay: 'none' };

const configReducer = createReducer(
    initialState,
    on(ConfigActions.setConfig, (_, { config }) => config)
);

export function reducer(state: State | undefined, action: Action) {
    return configReducer(state, action);
}

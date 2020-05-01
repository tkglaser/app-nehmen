import { ActionReducerMap } from '@ngrx/store';

import { ConfigModel } from '../models';
import * as ConfigStore from './config.reducer';

export interface AppState {
    config: ConfigModel;
}

export const reducers: ActionReducerMap<AppState> = {
    config: ConfigStore.reducer,
};

export const selectConfig = (state: AppState) => state.config;

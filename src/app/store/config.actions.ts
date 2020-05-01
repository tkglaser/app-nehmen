import { createAction, props } from '@ngrx/store';

import { ConfigModel } from '../models';

export const setConfig = createAction(
    '[Settings] Set All',
    props<{ config: ConfigModel }>()
);

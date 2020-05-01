import { createAction, props } from '@ngrx/store';

import { ConfigModel } from '../models';

export class SetConfig {
    static readonly type = '[Settings] Set All';
    constructor(public config: ConfigModel) {}
}

export const setConfig = createAction(
    '[Settings] Set All',
    props<{ config: ConfigModel }>()
);

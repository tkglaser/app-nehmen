import { ConfigModel } from '../models';

export class SetConfig {
    static readonly type = '[Settings] Set All';
    constructor(public config: ConfigModel) {}
}

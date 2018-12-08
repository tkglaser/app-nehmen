import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { pluck, distinctUntilChanged } from 'rxjs/operators';

import { Config } from '../models/config.model';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private settings = new BehaviorSubject<Config>({ maxCalories: 1700 });

    constructor() {}

    maxCalories() {
        return this.settings.pipe(
            pluck<Config, number>('maxCalories'),
            distinctUntilChanged()
        );
    }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { pluck, distinctUntilChanged } from 'rxjs/operators';

import { Config } from '../models/config.model';
import { LocalStorageService } from './local-storage.service';

const key_config = 'calory_config';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private settings = new BehaviorSubject<Config>({ maxCalories: 1700 });

    constructor(private localStorageService: LocalStorageService) {
        this.settings.next(
            localStorageService.get(key_config, { maxCalories: 1700 })
        );
    }

    maxCalories() {
        return this.settings.pipe(
            pluck<Config, number>('maxCalories'),
            distinctUntilChanged()
        );
    }

    setMaxCalories(value: number) {
        const newState = { ...this.settings.value, maxCalories: value };
        this.settings.next(newState);
        this.localStorageService.set(key_config, newState);
    }
}

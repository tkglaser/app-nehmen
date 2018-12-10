import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { pluck, distinctUntilChanged } from 'rxjs/operators';

import { Config } from '../models/config.model';
import { LocalStorageService } from './local-storage.service';
import { IndexDbService } from './index-db.service';

const key_config = 'calory_config';
const key_max_calories = 'max_calories';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private settings = new BehaviorSubject<Config>({ maxCalories: 1700 });

    constructor(
        private localStorageService: LocalStorageService,
        private db: IndexDbService
    ) {
        this.init();
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
        this.db.setSetting(key_max_calories, value);
    }

    private async init() {
        await this.migrate();
        const maxCalories = await this.db.getSetting<number>(
            key_max_calories,
            1700
        );
        this.settings.next({ maxCalories });
    }

    private async migrate() {
        const legacy = this.localStorageService.get<{ maxCalories: number }>(
            key_config,
            undefined
        );
        if (legacy) {
            await this.db.setSetting(key_max_calories, legacy.maxCalories);
            this.localStorageService.delete(key_config);
        }
    }
}

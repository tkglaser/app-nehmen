import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { pluck, distinctUntilChanged, map } from 'rxjs/operators';

import { Config } from '../models/config.model';
import { setSetting, db, getSetting } from '../db';
import { DayOfWeek } from '../models/day-of-week.model';
import { isDayOfWeekToday } from '../utils/date.utils';

const key_max_calories = 'max_calories';
const key_cheat_day = 'cheat_day';

const defaultValues: Config = { maxCalories: 1700, cheatDay: 'none' };

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private settings = new BehaviorSubject<Config>(defaultValues);

    constructor() {
        this.load();
    }

    getSettings() {
        return this.settings.asObservable();
    }

    maxCalories() {
        return this.settings.pipe(
            pluck<Config, number>('maxCalories'),
            distinctUntilChanged()
        );
    }

    isCheatDay() {
        return this.settings.pipe(
            pluck<Config, string>('cheatDay'),
            distinctUntilChanged(),
            map(isDayOfWeekToday)
        );
    }

    async setSettings(config: Config) {
        await setSetting(db, key_max_calories, config.maxCalories);
        await setSetting(db, key_cheat_day, config.cheatDay);
        await this.load();
    }

    private async load() {
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
        this.settings.next({ maxCalories, cheatDay });
    }
}

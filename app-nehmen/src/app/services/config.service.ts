import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { pluck, distinctUntilChanged, map } from 'rxjs/operators';

import { setSetting, db, getSetting } from '../db';
import { isDayOfWeekToday } from '../utils';
import { ClockService } from './clock.service';
import { Config, DayOfWeek } from '../models';

const key_max_calories = 'max_calories';
const key_cheat_day = 'cheat_day';

const defaultValues: Config = { maxCalories: 1700, cheatDay: 'none' };

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private settings = new BehaviorSubject<Config>(defaultValues);

    constructor(private clockService: ClockService) {
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
        return combineLatest(this.settings, this.clockService.today()).pipe(
            map(([settings]) => {
                if (settings.cheatDay === 'none') {
                    return false;
                } else {
                    return isDayOfWeekToday(settings.cheatDay);
                }
            }),
            distinctUntilChanged()
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

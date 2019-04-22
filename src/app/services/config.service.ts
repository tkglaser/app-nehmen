import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';

import { db, getSetting, setSetting } from '../db';
import { ConfigModel, DayOfWeek } from '../models';
import { isDayOfWeekToday } from '../utils';
import { ClockService } from './clock.service';

const key_max_calories = 'max_calories';
const key_cheat_day = 'cheat_day';

const defaultValues: ConfigModel = { maxCalories: 1700, cheatDay: 'none' };

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private settings = new BehaviorSubject<ConfigModel>(defaultValues);

    constructor(private clockService: ClockService) {
        this.load();
    }

    getSettings() {
        return this.settings.asObservable();
    }

    maxCalories() {
        return this.settings.pipe(
            pluck<ConfigModel, number>('maxCalories'),
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

    async setSettings(config: ConfigModel) {
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

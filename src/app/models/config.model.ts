import { DayOfWeek } from './day-of-week.model';

export interface ConfigModel {
    maxCalories: number;
    cheatDay: DayOfWeek | 'none';
}

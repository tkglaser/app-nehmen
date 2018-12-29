import { DayOfWeek } from './day-of-week.model';

export interface Config {
    maxCalories: number;
    cheatDay: DayOfWeek | 'none';
}

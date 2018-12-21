import * as moment from 'moment';
import { DayOfWeek } from '../models/day-of-week.model';

export function dayString(date: Date | number): string {
    let internalDate: Date;
    if (typeof date === 'number') {
        internalDate = new Date(date);
    } else {
        internalDate = date;
    }
    return moment(internalDate).format('YYYY-MM-DD');
}

export function friendlyDay(day: string) {
    return moment(day).calendar(null, {
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'YYYY-MM-DD'
    });
}

export function todayString() {
    return moment().format('YYYY-MM-DD');
}

export function prevDay(day: string): string {
    const newDay = moment(day).subtract(1, 'day');
    return newDay.format('YYYY-MM-DD');
}

export function nextDay(day: string): string {
    const newDay = moment(day).add(1, 'day');
    return newDay.format('YYYY-MM-DD');
}

export function isDayOfWeekToday(dayOfWeek: DayOfWeek) {
    const today = moment().isoWeekday();
    return (
        (today === 1 && dayOfWeek === 'mon') ||
        (today === 2 && dayOfWeek === 'tue') ||
        (today === 3 && dayOfWeek === 'wed') ||
        (today === 4 && dayOfWeek === 'thu') ||
        (today === 5 && dayOfWeek === 'fri') ||
        (today === 6 && dayOfWeek === 'sat') ||
        (today === 7 && dayOfWeek === 'sun')
    );
}

import * as moment from 'moment';

export function dayString(date: Date | number): string {
    let internalDate: Date;
    if (typeof date === 'number') {
        internalDate = new Date(date);
    } else {
        internalDate = date;
    }
    return moment(internalDate).format('YYYY-MM-DD');
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

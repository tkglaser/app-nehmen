import * as moment from 'moment';

export function isToday(date: number): boolean {
    const todaysDate = new Date().setHours(0, 0, 0, 0);
    const input = new Date(date).setHours(0, 0, 0, 0);
    return input === todaysDate;
}

export function dayString(date: Date | number): string {
    let internalDate: Date;
    if (typeof date === 'number') {
        internalDate = new Date(date);
    } else {
        internalDate = date;
    }
    return moment(internalDate).format('YYYY-MM-DD');
}

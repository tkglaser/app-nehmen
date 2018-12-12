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

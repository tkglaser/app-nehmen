import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { map, distinctUntilChanged, startWith } from 'rxjs/operators';
import { todayString } from '../utils/date.utils';

@Injectable({
    providedIn: 'root'
})
export class ClockService {
    clock = interval(1000);

    constructor() {}

    today(): Observable<string> {
        return this.clock.pipe(
            startWith(null),
            map(() => todayString()),
            distinctUntilChanged()
        );
    }
}

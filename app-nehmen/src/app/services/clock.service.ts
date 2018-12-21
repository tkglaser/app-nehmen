import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { map, distinctUntilChanged, share, startWith } from 'rxjs/operators';
import { todayString } from '../utils/date.utils';

const refreshIntervalMs = 1000;

@Injectable({
    providedIn: 'root'
})
export class ClockService {
    private clock = interval(refreshIntervalMs);
    private todayInternal: Observable<string>();

    constructor() {
        this.todayInternal = this.clock.pipe(
            startWith(null),
            map(() => todayString()),
            distinctUntilChanged(),
            share()
        )
    }

    today(): Observable<string> {
        return this.todayInternal;
    }
}

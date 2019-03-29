import { Injectable, OnDestroy } from '@angular/core';
import { interval, Observable, BehaviorSubject, defer } from 'rxjs';
import {
    map,
    distinctUntilChanged,
    startWith,
    switchMapTo
} from 'rxjs/operators';

import { todayString } from '../utils';

const refreshIntervalMs = 1000;

@Injectable({
    providedIn: 'root'
})
export class ClockService implements OnDestroy {
    private clock = interval(refreshIntervalMs);
    private todayInternal: Observable<string>;
    private intervalhandle: any;
    private tickety = new BehaviorSubject<number>(0);

    constructor() {
        this.intervalhandle = setInterval(
            () => this.tickety.next(this.tickety.value + 1),
            refreshIntervalMs
        );
        this.todayInternal = this.clock.pipe(
            startWith(null),
            map(() => todayString()),
            distinctUntilChanged()
        );
    }

    today(): Observable<string> {
        return this.todayInternal;
    }

    poll<T>(source: () => Observable<T>) {
        return this.tickety.pipe(switchMapTo(defer(source)));
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalhandle);
    }
}

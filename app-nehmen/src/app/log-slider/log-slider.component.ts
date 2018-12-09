import { Component, forwardRef, Input, OnInit, OnDestroy } from '@angular/core';
import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
    FormControl
} from '@angular/forms';
import { Subscription } from 'rxjs';

const options = [
    0,
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100,
    110,
    120,
    130,
    140,
    150,
    160,
    170,
    180,
    190,
    200,
    220,
    240,
    260,
    280,
    300,
    350,
    400,
    450,
    500,
    550,
    600,
    650,
    700,
    750,
    800,
    850,
    900,
    950,
    1000,
    1100,
    1200,
    1300,
    1400,
    1500
];

function mapToInternal(value: number) {
    const idx = options.findIndex(v => v === value);
    if (idx === -1) {
        return 0;
    } else {
        return idx;
    }
}

function mapToExternal(value: number) {
    if (options.length > value) {
        return options[value];
    } else {
        return value;
    }
}

@Component({
    selector: 'app-log-slider',
    templateUrl: './log-slider.component.html',
    styleUrls: ['./log-slider.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LogSliderComponent),
            multi: true
        }
    ]
})
export class LogSliderComponent
    implements ControlValueAccessor, OnInit, OnDestroy {
    internalControl = new FormControl();
    subscriptions = new Subscription();
    value = 0;

    propagateChange = (value: number) => {};
    propagateTouched = () => {};

    constructor() {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.internalControl.valueChanges.subscribe(value => {
                this.propagateChange(mapToExternal(value));
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    writeValue(value: number): void {
        this.value = value || 0;
        this.internalControl.setValue(mapToInternal(value));
    }

    registerOnChange(fn: any): void {
        this.propagateChange = externalValue => {
            this.value = externalValue;
            fn(externalValue);
        };
    }
    registerOnTouched(fn: any): void {
        this.propagateTouched = fn;
    }

    formatLabel(value: number | null) {
        if (!value) {
            return 0;
        } else {
            return mapToExternal(value);
        }
    }
}

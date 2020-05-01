import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { DayOfWeek, SelectOption } from '../models';
import * as ConfigActions from '../store/config.actions';
import * as AppStore from '../store';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
    configForm = this.fb.group({
        maxCalories: [
            '',
            [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
        cheatDay: '',
    });
    cheatDayOptions: SelectOption<DayOfWeek | 'none'>[] = [
        { id: 'none', text: 'No Cheat Day' },
        { id: 'mon', text: 'Monday' },
        { id: 'tue', text: 'Tuesday' },
        { id: 'wed', text: 'Wednesday' },
        { id: 'thu', text: 'Thursday' },
        { id: 'fri', text: 'Friday' },
        { id: 'sat', text: 'Saturday' },
        { id: 'sun', text: 'Sunday' },
    ];
    subscriptions = new Subscription();

    constructor(
        private fb: FormBuilder,
        private store: Store,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.store
                .select(AppStore.selectConfig)
                .subscribe((config) => this.configForm.patchValue(config))
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onSubmit() {
        const formValue = this.configForm.value;
        this.store.dispatch(
            ConfigActions.setConfig({
                config: {
                    cheatDay: formValue.cheatDay,
                    maxCalories: +formValue.maxCalories,
                },
            })
        );
        this.router.navigate(['dashboard']);
    }
}

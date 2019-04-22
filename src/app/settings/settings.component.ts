import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';

import { DayOfWeek, SelectOption } from '../models';
import { SetConfig } from '../store/config.actions';
import { ConfigState } from '../store/config.state';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
    configForm = this.fb.group({
        maxCalories: [
            '',
            [Validators.required, Validators.pattern('^[0-9]*$')]
        ],
        cheatDay: ''
    });
    cheatDayOptions: SelectOption<DayOfWeek | 'none'>[] = [
        { id: 'none', text: 'No Cheat Day' },
        { id: 'mon', text: 'Monday' },
        { id: 'tue', text: 'Tuesday' },
        { id: 'wed', text: 'Wednesday' },
        { id: 'thu', text: 'Thursday' },
        { id: 'fri', text: 'Friday' },
        { id: 'sat', text: 'Saturday' },
        { id: 'sun', text: 'Sunday' }
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
                .select(ConfigState.config)
                .subscribe(config => this.configForm.patchValue(config))
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onSubmit() {
        const formValue = this.configForm.value;
        this.store.dispatch(
            new SetConfig({
                cheatDay: formValue.cheatDay,
                maxCalories: +formValue.maxCalories
            })
        );
        this.router.navigate(['dashboard']);
    }
}

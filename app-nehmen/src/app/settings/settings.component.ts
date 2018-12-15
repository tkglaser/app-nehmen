import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ConfigService } from '../services/config.service';
import { SelectOption } from '../models/select-option.model';
import { DayOfWeek } from '../models/day-of-week.model';

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
        private configService: ConfigService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.configService
                .getSettings()
                .subscribe(value => this.configForm.patchValue(value))
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onSubmit() {
        const formValue = this.configForm.value;
        this.configService.setSettings(formValue);
        this.router.navigate(['dashboard']);
    }
}

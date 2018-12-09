import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ConfigService } from '../services/config.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
    configForm = this.fb.group({
        maxCalories: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });
    subscriptions = new Subscription();

    constructor(
        private fb: FormBuilder,
        private configService: ConfigService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.configService
                .maxCalories()
                .subscribe(maxCal =>
                    this.configForm.patchValue({ maxCalories: maxCal })
                )
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onSubmit() {
        const formValue = this.configForm.value;
        this.configService.setMaxCalories(formValue.maxCalories);
        this.router.navigate(['dashboard']);
    }
}

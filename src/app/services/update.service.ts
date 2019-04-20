import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

const updateIntervalMs = 6 * 60 * 60 * 1000;

@Injectable({
    providedIn: 'root'
})
export class UpdateService {
    constructor(private swUpdate: SwUpdate, private snackbar: MatSnackBar) {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.available.subscribe(() => {
                const snack = this.snackbar.open('Update Available', 'Reload');

                snack.onAction().subscribe(() => {
                    window.location.reload();
                });

                setTimeout(() => {
                    snack.dismiss();
                }, 6000);
            });
            swUpdate.checkForUpdate();
            interval(updateIntervalMs).subscribe(() =>
                swUpdate.checkForUpdate()
            );
        }
    }
}

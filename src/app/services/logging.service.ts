import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export class LoggingService {
    constructor(private snackBar: MatSnackBar) {}

    log(message: string) {
        this.snackBar.open(message, '', {
            duration: 3000
        });
    }
}

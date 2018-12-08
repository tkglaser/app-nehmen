import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { EntryService } from '../services/entry.service';

@Component({
    selector: 'app-add-entry',
    templateUrl: './add-entry.component.html',
    styleUrls: ['./add-entry.component.scss']
})
export class AddEntryComponent {
    entryForm = this.fb.group({
        calories: 0,
        description: ''
    });

    constructor(
        private fb: FormBuilder,
        private entryService: EntryService,
        private router: Router
    ) {}

    onSubmit() {
        this.entryService.addEntry(this.entryForm.value);
        this.router.navigate(['dashboard']);
    }
}

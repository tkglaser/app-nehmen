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
        calories: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
        description: ['', [Validators.required]]
    });

    constructor(private fb: FormBuilder, private entryService: EntryService) {}

    onSubmit() {
        this.entryService.addEntry(this.entryForm.value);
        this.entryForm.reset(
            { calories: '', description: '' },
            { onlySelf: false }
        );
    }
}

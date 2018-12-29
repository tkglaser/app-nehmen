import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material';

import { EntryService } from '../services/entry.service';
import { AutoSuggestion } from '../models';

@Component({
    selector: 'app-add-entry',
    templateUrl: './add-entry.component.html',
    styleUrls: ['./add-entry.component.scss']
})
export class AddEntryComponent implements OnInit {
    entryForm = this.fb.group({
        calories: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
        description: ['', [Validators.required]],
        exercise: false
    });

    options$: Observable<AutoSuggestion[]>;

    @ViewChild('form') form;
    @ViewChild('addbtn') addbtn;

    constructor(private fb: FormBuilder, private entryService: EntryService) {}

    ngOnInit(): void {
        this.options$ = this.entryForm.get('description').valueChanges.pipe(
            startWith(''),
            switchMap(value => this.entryService.selectAutoSuggestions(value))
        );
    }

    onAutocomplete(event: MatAutocompleteSelectedEvent) {
        this.entryForm.patchValue(event.option.value);
        this.addbtn.focus();
    }

    onSubmit() {
        this.entryService.addEntry(this.entryForm.value);
        this.entryForm.reset(
            { calories: '', description: '' },
            { onlySelf: false }
        );
        this.form.resetForm();
    }
}

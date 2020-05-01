import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { AutoSuggestionModel } from '../models';
import * as EntriesActions from '../store/entries.actions';
import { selectAutoSuggestions } from '../store';

@Component({
    selector: 'app-add-entry',
    templateUrl: './add-entry.component.html',
    styleUrls: ['./add-entry.component.scss'],
})
export class AddEntryComponent implements OnInit {
    entryForm = this.fb.group({
        calories: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
        description: ['', [Validators.required]],
        exercise: false,
    });

    options$: Observable<AutoSuggestionModel[]>;

    @ViewChild('form', { static: true }) form;
    @ViewChild('addbtn', { static: true }) addbtn;

    constructor(private fb: FormBuilder, private store: Store) {}

    ngOnInit(): void {
        this.options$ = this.entryForm.get('description').valueChanges.pipe(
            startWith(''),
            switchMap((value) =>
                this.store.select(selectAutoSuggestions(value))
            )
        );
    }

    onAutocomplete(event: MatAutocompleteSelectedEvent) {
        this.entryForm.patchValue(event.option.value);
        this.addbtn.focus();
    }

    onSubmit() {
        this.store.dispatch(
            EntriesActions.addEntry({
                entry: { ...this.entryForm.value, id: uuid() },
            })
        );
        this.entryForm.reset(
            { calories: '', description: '' },
            { onlySelf: false }
        );
        this.form.resetForm();
    }
}

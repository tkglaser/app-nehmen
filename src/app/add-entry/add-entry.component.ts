import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { AutoSuggestionModel } from '../models';
import { AddEntry } from '../store/entries.actions';
import { EntriesState } from '../store/entries.state';

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

    options$: Observable<AutoSuggestionModel[]>;

    @ViewChild('form', { static: true }) form;
    @ViewChild('addbtn', { static: true }) addbtn;

    constructor(
        private fb: FormBuilder,
        private store: Store
    ) {}

    ngOnInit(): void {
        this.options$ = this.entryForm.get('description').valueChanges.pipe(
            startWith(''),
            switchMap(value =>
                this.store.select(EntriesState.autoSuggestions(value))
            )
        );
    }

    onAutocomplete(event: MatAutocompleteSelectedEvent) {
        this.entryForm.patchValue(event.option.value);
        this.addbtn.focus();
    }

    onSubmit() {
        this.store.dispatch(new AddEntry(this.entryForm.value));
        this.entryForm.reset(
            { calories: '', description: '' },
            { onlySelf: false }
        );
        this.form.resetForm();
    }
}

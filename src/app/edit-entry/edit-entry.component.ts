import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { filter, pluck, switchMap } from 'rxjs/operators';

import { EntryAddModel } from '../models';
import { AddEntry, DeleteEntry, UpdateEntry } from '../store/entries.actions';
import { EntriesState } from '../store/entries.state';

@Component({
    selector: 'app-edit-entry',
    templateUrl: './edit-entry.component.html',
    styleUrls: ['./edit-entry.component.scss']
})
export class EditEntryComponent implements OnInit {
    entryForm = this.fb.group({
        id: '',
        calories: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
        description: ['', [Validators.required]],
        exercise: false
    });

    constructor(
        private fb: FormBuilder,
        private store: Store,
        private route: ActivatedRoute,
        private router: Router
    ) {
        route.params
            .pipe(
                pluck<Params, string>('id'),
                switchMap(id =>
                    this.store.select(EntriesState.entriesById(id))
                ),
                filter(e => !!e)
            )
            .subscribe(entry => this.entryForm.patchValue(entry));
    }

    ngOnInit() {}

    onSubmit() {
        const formValue: any = this.entryForm.value;
        this.store.dispatch(
            new UpdateEntry(formValue.id, {
                calories: +formValue.calories,
                description: formValue.description,
                exercise: formValue.exercise
            })
        );
        this.backToDash();
    }

    onClone() {
        const formValue: EntryAddModel = this.entryForm.value;
        this.store.dispatch(
            new AddEntry({
                calories: +formValue.calories,
                description: formValue.description,
                exercise: formValue.exercise
            })
        );
        this.backToDash();
    }

    onCancel() {
        this.backToDash();
    }

    onDelete() {
        this.store.dispatch(new DeleteEntry(this.entryForm.value.id));
        this.backToDash();
    }

    private backToDash() {
        this.router.navigate(['dashboard']);
    }
}

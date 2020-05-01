import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, pluck } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { EntryAddModel } from '../models';
import * as EntriesActions from '../store/entries.actions';
import { selectEntryById } from '../store';
import { snapshot } from '../utils/ngrx.utils';

@Component({
    selector: 'app-edit-entry',
    templateUrl: './edit-entry.component.html',
    styleUrls: ['./edit-entry.component.scss'],
})
export class EditEntryComponent implements OnInit {
    entryForm = this.fb.group({
        id: '',
        calories: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
        description: ['', [Validators.required]],
        exercise: false,
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
                map((id) => snapshot(this.store, selectEntryById(id))),
                filter((e) => !!e)
            )
            .subscribe((entry) => this.entryForm.patchValue(entry));
    }

    ngOnInit() {}

    onSubmit() {
        const formValue: any = this.entryForm.value;
        this.store.dispatch(
            EntriesActions.updateEntry({
                entryId: formValue.id,
                updates: {
                    calories: +formValue.calories,
                    description: formValue.description,
                    exercise: formValue.exercise,
                },
            })
        );
        this.backToDash();
    }

    onClone() {
        const formValue: EntryAddModel = this.entryForm.value;
        this.store.dispatch(
            EntriesActions.addEntry({
                entry: {
                    id: uuid(),
                    calories: +formValue.calories,
                    description: formValue.description,
                    exercise: formValue.exercise,
                },
            })
        );
        this.backToDash();
    }

    onCancel() {
        this.backToDash();
    }

    onDelete() {
        this.store.dispatch(
            EntriesActions.deleteEntry({ entryId: this.entryForm.value.id })
        );
        this.backToDash();
    }

    private backToDash() {
        this.router.navigate(['dashboard']);
    }
}

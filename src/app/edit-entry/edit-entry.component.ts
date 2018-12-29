import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { EntryService } from '../services/entry.service';
import { pluck, switchMap, filter } from 'rxjs/operators';
import { EntryUpdate, EntryAdd } from '../models';

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
        private entryService: EntryService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        route.params
            .pipe(
                pluck<Params, string>('id'),
                switchMap(id => entryService.selectEntry(id)),
                filter(e => !!e)
            )
            .subscribe(entry => this.entryForm.patchValue(entry));
    }

    ngOnInit() {}

    onSubmit() {
        const formValue: EntryUpdate = this.entryForm.value;
        this.entryService.editEntry({
            id: formValue.id,
            calories: +formValue.calories,
            description: formValue.description,
            exercise: formValue.exercise
        });
        this.backToDash();
    }

    onClone() {
        const formValue: EntryAdd = this.entryForm.value;
        this.entryService.addEntry({
            calories: +formValue.calories,
            description: formValue.description,
            exercise: formValue.exercise
        });
        this.backToDash();
    }

    onCancel() {
        this.backToDash();
    }

    onDelete() {
        this.entryService.removeEntry(this.entryForm.value.id);
        this.backToDash();
    }

    private backToDash() {
        this.router.navigate(['dashboard']);
    }
}

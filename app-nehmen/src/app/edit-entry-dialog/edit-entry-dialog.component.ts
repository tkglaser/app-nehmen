import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';

import { Entry } from '../models/entry.model';
import { EntryService } from '../services/entry.service';
import { EntryAdd } from '../models/entry-add.model';

@Component({
    templateUrl: './edit-entry-dialog.component.html',
    styleUrls: ['./edit-entry-dialog.component.scss']
})
export class EditEntryDialogComponent {
    entryForm = this.fb.group({
        id: '',
        calories: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
        description: ['', [Validators.required]]
    });

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<EditEntryDialogComponent>,
        private entriesService: EntryService,
        @Inject(MAT_DIALOG_DATA) public data: { entry: Entry }
    ) {
        this.entryForm.patchValue(data.entry);
    }

    onSubmit() {}

    onClone() {
        const formValue: EntryAdd = this.entryForm.value;
        this.entriesService.addEntry({
            calories: +formValue.calories,
            description: formValue.description
        });
        this.dialogRef.close();
    }

    onCancel() {
        this.dialogRef.close();
    }

    onDelete() {
        this.entriesService.removeEntry(this.entryForm.value.id);
        this.dialogRef.close();
    }
}

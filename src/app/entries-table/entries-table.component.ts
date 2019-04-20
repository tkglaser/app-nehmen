import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { EntryModel } from '../models';

@Component({
    selector: 'app-entries-table',
    templateUrl: './entries-table.component.html',
    styleUrls: ['./entries-table.component.scss']
})
export class EntriesTableComponent {
    @Input()
    dataSource: Observable<EntryModel[]> = new BehaviorSubject<EntryModel[]>([]);

    displayedColumns: Array<keyof EntryModel | 'actions'> = [
        'description',
        'calories',
        'created',
        'actions'
    ];

    constructor(private router: Router) {}

    onRowClick(entry: EntryModel) {
        this.router.navigate(['edit', entry.id]);
    }
}

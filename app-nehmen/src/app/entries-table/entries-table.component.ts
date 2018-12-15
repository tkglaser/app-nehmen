import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

import { Entry } from '../models/entry.model';

@Component({
    selector: 'app-entries-table',
    templateUrl: './entries-table.component.html',
    styleUrls: ['./entries-table.component.scss']
})
export class EntriesTableComponent {
    @Input()
    dataSource: Observable<Entry[]> = new BehaviorSubject<Entry[]>([]);

    displayedColumns: string[] = [
        'description',
        'calories',
        'timestamp',
        'actions'
    ];

    constructor(private router: Router) {}

    onRowClick(entry: Entry) {
        this.router.navigate(['edit', entry.id]);
    }
}

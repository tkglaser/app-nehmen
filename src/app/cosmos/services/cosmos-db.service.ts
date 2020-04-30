import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';

import { CosmosClientService } from './cosmos-client.service';
import { UserEntryModel } from 'src/app/models/user-entry.model';

@Injectable({
    providedIn: 'root',
})
export class CosmosDbService {
    constructor(private readonly clientService: CosmosClientService) {}

    getAllEntries() {
        return this.query<UserEntryModel[]>('select * from c');
    }

    upsertEntry(entry: UserEntryModel) {
        return this.clientService
            .getCollection()
            .pipe(
                switchMap((collection) =>
                    collection.items.upsert<UserEntryModel>(entry)
                ),
                map(response => response.resource)
            );
    }

    private query<T>(query: string) {
        return this.clientService.getCollection().pipe(
            switchMap((collection) =>
                collection.items.query<T>(query).fetchAll()
            ),
            map((result) => result.resources)
        );
    }
}

import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';

import { CosmosClientService } from './cosmos-client.service';
import { CosmosEntryModel } from 'src/app/models/cosmos-entry.model';
import { EntryModel } from 'src/app/models';

@Injectable({
    providedIn: 'root',
})
export class CosmosDbService {
    constructor(private readonly clientService: CosmosClientService) {}

    getAllEntries() {
        return this.query<CosmosEntryModel[]>('select * from c');
    }

    upsertEntry(entry: EntryModel) {
        const currentUserId = this.getCurrentUserId();
        const cosmosEntry: CosmosEntryModel = {
            ...entry,
            pk: currentUserId,
            userId: currentUserId,
            type: 'caloriesEntry',
        };
        return this.clientService.getCollection().pipe(
            switchMap((collection) =>
                collection.items.upsert<CosmosEntryModel>(cosmosEntry)
            ),
            map((response) => response.resource)
        );
    }

    private getCurrentUserId() {
        return 'TODO';
    }

    private query<T>(query: string) {
        return this.clientService.getCollection().pipe(
            switchMap((collection) =>
                collection.items
                    .query<T>(query, {
                        partitionKey: this.getCurrentUserId(),
                    })
                    .fetchAll()
            ),
            map((result) => result.resources)
        );
    }
}

import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';

import { CosmosClientService } from './cosmos-client.service';
import { CosmosEntryModel } from 'src/app/models/cosmos-entry.model';
import { EntryModel, ConfigModel } from 'src/app/models';

@Injectable({
    providedIn: 'root',
})
export class CosmosDbService {
    constructor(private readonly clientService: CosmosClientService) {}

    getAllEntries() {
        return this.query<CosmosEntryModel[]>(
            'select * from c where c.type="caloriesEntry"'
        );
    }

    getConfig() {
        return this.getItem<ConfigModel>(`settings_${this.getCurrentUserId()}`);
    }

    setConfig(config: ConfigModel) {
        const currentUserId = this.getCurrentUserId();
        const item = {
            ...config,
            id: `settings_${this.getCurrentUserId()}`,
            pk: this.getCurrentUserId(),
            userId: currentUserId,
            type: 'settings',
        };
        return this.upsertItem(item);
    }

    upsertEntry(entry: EntryModel) {
        const currentUserId = this.getCurrentUserId();
        const item: CosmosEntryModel = {
            ...entry,
            pk: currentUserId,
            userId: currentUserId,
            type: 'caloriesEntry',
        };
        return this.upsertItem(item);
    }

    private getCurrentUserId() {
        return 'TODO';
    }

    private getItem<T>(id: string) {
        return this.clientService.getCollection().pipe(
            switchMap((collection) =>
                collection.item(id, this.getCurrentUserId()).read<T>()
            ),
            map((result) => result.resource)
        );
    }

    private upsertItem<T>(item: T) {
        return this.clientService.getCollection().pipe(
            switchMap((collection) => collection.items.upsert<T>(item)),
            map((result) => result.resource)
        );
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

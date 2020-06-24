import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';
import { from, of } from 'rxjs';

import { CosmosClientService } from './cosmos-client.service';
import { CosmosEntryModel } from 'src/app/models/cosmos-entry.model';
import { EntryModel, ConfigModel } from 'src/app/models';

@Injectable({
    providedIn: 'root',
})
export class CosmosDbService {
    constructor(
        private readonly clientService: CosmosClientService,
        private readonly oauthService: OAuthService
    ) {}

    getAllEntries() {
        if (this.getCurrentUserId()) {
            return this.query<CosmosEntryModel>(
                'select * from c where c.type="caloriesEntry"'
            );
        } else {
            return of([]);
        }
    }

    getConfig() {
        return this.getItem<ConfigModel>(`settings_${this.getCurrentUserId()}`);
    }

    setConfig(config: ConfigModel) {
        const currentUserId = this.getCurrentUserId();
        if (currentUserId) {
            const item = {
                ...config,
                id: `settings_${currentUserId}`,
                pk: currentUserId,
                userId: currentUserId,
                type: 'settings',
            };
            return this.upsertItem(item);
        } else {
            return of(null);
        }
    }

    upsertEntry(entry: EntryModel) {
        const currentUserId = this.getCurrentUserId();
        if (currentUserId) {
            const item: CosmosEntryModel = {
                ...entry,
                pk: currentUserId,
                userId: currentUserId,
                type: 'caloriesEntry',
            };
            return this.upsertItem(item);
        } else {
            return of(null);
        }
    }

    private getCurrentUserId() {
        const claims = this.oauthService.getIdentityClaims() as any;
        return claims?.sub;
    }

    private getItem<T>(id: string) {
        const collection = this.clientService.getCollection();
        return from(
            collection.item(id, this.getCurrentUserId()).read<T>()
        ).pipe(map((result) => result.resource));
    }

    private upsertItem<T>(item: T) {
        const collection = this.clientService.getCollection();
        return from(collection.items.upsert<T>(item)).pipe(
            map((result) => result.resource)
        );
    }

    private query<T>(query: string) {
        const collection = this.clientService.getCollection();
        return from(
            collection.items
                .query<T>(query, {
                    partitionKey: this.getCurrentUserId(),
                })
                .fetchAll()
        ).pipe(map((result) => result.resources));
    }
}

import { Injectable } from '@angular/core';
import { CosmosClient } from '@azure/cosmos';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

const dbName = 'AppNehmen';
const containerName = 'Items';

@Injectable({
    providedIn: 'root',
})
export class CosmosClientService {
    constructor(
        private readonly http: HttpClient,
    ) {}

    getCollection() {
        const client = new CosmosClient({
            endpoint: environment.cosmosDbEndpoint,
            tokenProvider: async () => {
                const token = await this.getResourceToken().toPromise();
                return (token as any).token;
            },
        });
        return client.database(dbName).container(containerName);
    }

    private getResourceToken() {
        return this.http.get(environment.apiEndpoint + '/v1/data/token');
    }
}

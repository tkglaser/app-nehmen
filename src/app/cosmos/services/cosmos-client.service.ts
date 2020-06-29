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
    private token: string;
    private tokenExpires: number;
    private _client: CosmosClient;

    private get client() {
        if (!this._client) {
            this._client = new CosmosClient({
                endpoint: environment.cosmosDbEndpoint,
                tokenProvider: async () => {
                    if (this.token && this.tokenExpires > Date.now()) {
                        return this.token;
                    }
                    const token = await this.getResourceToken().toPromise();
                    this.token = (token as any).token;
                    this.tokenExpires = Date.now() + 30 * 60 * 1000; // 30min expiry
                    return this.token;
                },
            });
        }
        return this._client;
    }

    constructor(private readonly http: HttpClient) {}

    getCollection() {
        return this.client.database(dbName).container(containerName);
    }

    private getResourceToken() {
        return this.http.get(environment.apiEndpoint + '/v1/data/token');
    }
}

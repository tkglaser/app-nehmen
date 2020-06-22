import { Injectable } from '@angular/core';
import { CosmosClient } from '@azure/cosmos';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';

const dbName = 'AppNehmen';
const containerName = 'Items';

@Injectable({
    providedIn: 'root',
})
export class CosmosClientService {
    constructor(
        private readonly http: HttpClient,
        private readonly oauthService: OAuthService
    ) {}

    getCollection() {
        return this.getResourceToken().pipe(
            map((token) => {
                const client = new CosmosClient({
                    endpoint: environment.cosmosDbEndpoint,
                    tokenProvider: async () => {
                        const token = await this.getResourceToken().toPromise();
                        console.log(token);
                        return (token as any).token;
                    },
                });
                return client.database(dbName).container(containerName);
            })
        );
    }

    private getResourceToken() {
        console.log(this.oauthService.getIdentityClaims());
        return this.http.get(environment.apiEndpoint + '/v1/data/token');
    }
}

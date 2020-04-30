import { Injectable } from '@angular/core';
import { CosmosClient } from '@azure/cosmos';
import { from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

const dbName = 'AppNehmen';
const containerName = 'Items';

@Injectable({
    providedIn: 'root',
})
export class CosmosClientService {
    constructor() {}

    getCollection() {
        const client = new CosmosClient({
            endpoint: 'https://localhost:8081',
            key:
                'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==', // TODO: use resource tokens
        });
        // TODO: The container creation should really be part of a terraform script.
        return from(
            client.databases.createIfNotExists({
                id: dbName,
                throughput: 400,
            })
        ).pipe(
            switchMap(() =>
                client.database(dbName).containers.createIfNotExists({
                    id: containerName,
                    partitionKey: { paths: ['/pk'] },
                })
            ),
            map(() => client.database(dbName).container(containerName))
        );
    }
}

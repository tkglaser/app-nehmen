import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UniqueIdService {
    constructor() {}

    newGuid() {
        return (
            '_' +
            Math.random()
                .toString(36)
                .substr(2, 19)
        );
    }
}

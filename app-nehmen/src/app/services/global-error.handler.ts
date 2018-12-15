import { ErrorHandler, Injectable } from '@angular/core';

import { LoggingService } from './logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private log: LoggingService) {}
    handleError(error: Error) {
        this.log.log(error.message);
        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        // throw error;
    }
}

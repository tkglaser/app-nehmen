import { LoggingService } from 'src/app/services';

export class MockLoggingService {}

export const mockLoggingProvider = {
    provide: LoggingService,
    useClass: MockLoggingService
};

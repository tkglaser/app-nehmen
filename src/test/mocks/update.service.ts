import { UpdateService } from 'src/app/services';

export class MockUpdateService {}

export const mockUpdateProvider = {
    provide: UpdateService,
    useClass: MockUpdateService
};

import { TestBed } from '@angular/core/testing';

import { CosmosClientService } from './cosmos-client.service';

describe('CosmosClientService', () => {
  let service: CosmosClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CosmosClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

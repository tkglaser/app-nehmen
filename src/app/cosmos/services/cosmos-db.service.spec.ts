import { TestBed } from '@angular/core/testing';

import { CosmosDbService } from './cosmos-db.service';

describe('CosmosDbService', () => {
  let service: CosmosDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CosmosDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { DropboxService } from './dropbox.service';

describe('DropboxService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DropboxService = TestBed.get(DropboxService);
    expect(service).toBeTruthy();
  });
});

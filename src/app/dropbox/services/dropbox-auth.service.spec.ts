import { TestBed } from '@angular/core/testing';

import { DropboxAuthService } from './dropbox-auth.service';

describe('DropboxAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DropboxAuthService = TestBed.get(DropboxAuthService);
    expect(service).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropboxTestComponent } from './dropbox-test.component';

describe('DropboxTestComponent', () => {
  let component: DropboxTestComponent;
  let fixture: ComponentFixture<DropboxTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropboxTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropboxTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

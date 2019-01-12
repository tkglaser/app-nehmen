import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncLogComponent } from './sync-log.component';

describe('SyncLogComponent', () => {
  let component: SyncLogComponent;
  let fixture: ComponentFixture<SyncLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

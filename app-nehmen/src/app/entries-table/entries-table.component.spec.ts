import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntriesTableComponent } from './entries-table.component';

describe('EntriesTableComponent', () => {
  let component: EntriesTableComponent;
  let fixture: ComponentFixture<EntriesTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntriesTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntriesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

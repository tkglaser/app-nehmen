import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayEntriesComponent } from './day-entries.component';

describe('DayEntriesComponent', () => {
  let component: DayEntriesComponent;
  let fixture: ComponentFixture<DayEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayEntriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEntryDialogComponent } from './edit-entry-dialog.component';

describe('EditEntryDialogComponent', () => {
  let component: EditEntryDialogComponent;
  let fixture: ComponentFixture<EditEntryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEntryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEntryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

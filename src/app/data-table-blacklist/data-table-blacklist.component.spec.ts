import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableBlacklistComponent } from './data-table-blacklist.component';

describe('DataTableBlacklistComponent', () => {
  let component: DataTableBlacklistComponent;
  let fixture: ComponentFixture<DataTableBlacklistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataTableBlacklistComponent]
    });
    fixture = TestBed.createComponent(DataTableBlacklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

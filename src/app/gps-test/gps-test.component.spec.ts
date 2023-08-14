import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsTestComponent } from './gps-test.component';

describe('GpsTestComponent', () => {
  let component: GpsTestComponent;
  let fixture: ComponentFixture<GpsTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GpsTestComponent]
    });
    fixture = TestBed.createComponent(GpsTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

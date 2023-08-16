import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackResumeComponent } from './track-resume.component';

describe('TrackResumeComponent', () => {
  let component: TrackResumeComponent;
  let fixture: ComponentFixture<TrackResumeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrackResumeComponent]
    });
    fixture = TestBed.createComponent(TrackResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

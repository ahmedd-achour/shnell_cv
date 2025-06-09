import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistercarsComponent } from './registercars.component';

describe('RegistercarsComponent', () => {
  let component: RegistercarsComponent;
  let fixture: ComponentFixture<RegistercarsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistercarsComponent]
    });
    fixture = TestBed.createComponent(RegistercarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

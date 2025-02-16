import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Model1Component } from './model-1.component';

describe('Model1Component', () => {
  let component: Model1Component;
  let fixture: ComponentFixture<Model1Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Model1Component]
    });
    fixture = TestBed.createComponent(Model1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

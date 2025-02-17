import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Model4Component } from './model4.component';

describe('Model4Component', () => {
  let component: Model4Component;
  let fixture: ComponentFixture<Model4Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Model4Component]
    });
    fixture = TestBed.createComponent(Model4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CosechasComponent } from './cosechas.component';

describe('CosechasComponent', () => {
  let component: CosechasComponent;
  let fixture: ComponentFixture<CosechasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CosechasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CosechasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

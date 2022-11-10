import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodasComponent } from './podas.component';

describe('PodasComponent', () => {
  let component: PodasComponent;
  let fixture: ComponentFixture<PodasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PodasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

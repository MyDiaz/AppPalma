import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalmaComponent } from './palma.component';

describe('PalmaComponent', () => {
  let component: PalmaComponent;
  let fixture: ComponentFixture<PalmaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PalmaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlateosComponent } from './plateos.component';

describe('PlateosComponent', () => {
  let component: PlateosComponent;
  let fixture: ComponentFixture<PlateosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlateosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

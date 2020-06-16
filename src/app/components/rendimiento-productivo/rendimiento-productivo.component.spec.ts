import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoProductivoComponent } from './rendimiento-productivo.component';

describe('RendimientoProductivoComponent', () => {
  let component: RendimientoProductivoComponent;
  let fixture: ComponentFixture<RendimientoProductivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RendimientoProductivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RendimientoProductivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

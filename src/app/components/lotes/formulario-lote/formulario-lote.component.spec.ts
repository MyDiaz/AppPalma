import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioLoteComponent } from './formulario-lote.component';

describe('FormularioLoteComponent', () => {
  let component: FormularioLoteComponent;
  let fixture: ComponentFixture<FormularioLoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormularioLoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioLoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

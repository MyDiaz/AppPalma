import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createRouterSpy } from 'src/testing/spec-helpers';
import { FormularioLoteComponent } from './formulario-lote.component';

describe('FormularioLoteComponent', () => {
  let component: FormularioLoteComponent;
  let fixture: ComponentFixture<FormularioLoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FormularioLoteComponent],
      providers: [
        {
          provide: LoteService,
          useValue: {
            getLote: () =>
              of({
                nombre_lote: '',
                ano_siembra: '',
                hectareas: '',
                numero_palmas: '',
                material_siembra: '',
                mapa: '',
              }),
            postLote: () => of({ message: 'ok' }),
            putLote: () => of({ message: 'ok' }),
          },
        },
        { provide: Router, useValue: createRouterSpy() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioLoteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

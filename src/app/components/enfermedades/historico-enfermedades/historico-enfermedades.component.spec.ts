import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { HistoricoEnfermedadesComponent } from './historico-enfermedades.component';

describe('HistoricoEnfermedadesComponent', () => {
  let component: HistoricoEnfermedadesComponent;
  let fixture: ComponentFixture<HistoricoEnfermedadesComponent>;
  let enfermedadesServiceSpy: jasmine.SpyObj<EnfermedadesService>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    enfermedadesServiceSpy = jasmine.createSpyObj('EnfermedadesService', [
      'getEnfermedadesRegistradas',
      'getEnfermedadesConcat',
    ]);
    enfermedadesServiceSpy.getEnfermedadesRegistradas.and.returnValue(
      of([
        {
          nombre_lote: 'Lote 1',
          fecha_registro_enfermedad: '2026-01-01T00:00:00Z',
          nombre_enfermedad: 'rayo',
          etapa_enfermedad: 'inicial',
          observacion_registro_enfermedad: 'obs',
        },
      ])
    );
    enfermedadesServiceSpy.getEnfermedadesConcat.and.returnValue(
      of([{ concat: 'rayo inicial' }])
    );
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    loteServiceSpy.getLotes.and.returnValue(of([{ nombre_lote: 'Lote 1' } as any]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [HistoricoEnfermedadesComponent],
      providers: [
        { provide: EnfermedadesService, useValue: enfermedadesServiceSpy },
        { provide: LoteService, useValue: loteServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteMock({ queryParams: { lote: 'Lote 1' } }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoEnfermedadesComponent);
    component = fixture.componentInstance;
  });

  it('should create and load historico enfermedades', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(component.historicoEnfermedades.length).toBe(1);
    expect(component.procesoHistoricoEnfermedades.value.nombreLote).toBe('Lote 1');
    expect(component.procesoHistoricoEnfermedades.value.enfermedadConcat).toBe('TODAS');
  });

  it('should filter historico enfermedades by lote and disease', () => {
    component.historicoEnfermedades = [
      {
        nombre_lote: 'Lote 1',
        diaRegistroEnfermedad: new Date('2026-01-01T00:00:00Z'),
        nombre_enfermedad: 'rayo',
        etapa_enfermedad: 'inicial',
      },
    ];
    component.procesoHistoricoEnfermedades = new FormControl({
      nombreLote: 'Lote 1',
      enfermedadConcat: 'rayo inicial',
    }) as any;
    component.range.get('start').setValue(new Date('2025-12-01T00:00:00Z'));
    component.range.get('end').setValue(new Date('2026-12-31T00:00:00Z'));

    component.filtroEstadoHistoricoEnfermedades();

    expect(component.estadoHistoricoEnfermedades.data.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should report no-match and service error states', () => {
    component.historicoEnfermedades = [
      {
        nombre_lote: 'Lote 1',
        diaRegistroEnfermedad: new Date('2026-01-01T00:00:00Z'),
        nombre_enfermedad: 'rayo',
        etapa_enfermedad: 'inicial',
      },
    ];
    component.procesoHistoricoEnfermedades = new FormGroup({
      nombreLote: new FormControl('Lote 2'),
      enfermedadConcat: new FormControl('otra'),
    });
    component.range.get('start').setValue(new Date('2026-02-01T00:00:00Z'));
    component.range.get('end').setValue(new Date('2026-02-28T00:00:00Z'));

    component.filtroEstadoHistoricoEnfermedades();

    expect(component.estadoHistoricoEnfermedades.data.length).toBe(0);
    expect(component.filtradas).toBe('noEncontro');

    enfermedadesServiceSpy.getEnfermedadesRegistradas.and.returnValue(
      throwError({ status: 0, error: { message: 'boom' } })
    );
    loteServiceSpy.getLotes.and.returnValue(
      of([{ nombre_lote: 'Lote 1' } as any])
    );

    component.ngOnInit();

    expect(component.bandera_error).toBeTruthy();
    expect(component.mensaje_error).toBe('Servicio no disponible');
  });

});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AgroquimicosService } from 'src/app/Servicios/agroquimicos.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { AplicacionesComponent } from './aplicaciones.component';

describe('AplicacionesComponent', () => {
  let component: AplicacionesComponent;
  let fixture: ComponentFixture<AplicacionesComponent>;
  let agroquimicosServiceSpy: jasmine.SpyObj<AgroquimicosService>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    agroquimicosServiceSpy = jasmine.createSpyObj('AgroquimicosService', [
      'getRegistroAgroquimico',
    ]);
    agroquimicosServiceSpy.getRegistroAgroquimico.and.returnValue(
      of([
        {
          fecha_tratamiento: '2026-01-01T00:00:00Z',
          nombre_lote: 'Lote 1',
        },
      ])
    );
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    loteServiceSpy.getLotes.and.returnValue(
      of([{ nombre_lote: 'Lote 1' } as any])
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AplicacionesComponent],
      providers: [
        { provide: AgroquimicosService, useValue: agroquimicosServiceSpy },
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
    fixture = TestBed.createComponent(AplicacionesComponent);
    component = fixture.componentInstance;
  });

  it('should create and load historicos', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(component.historicoTratamientos.length).toBe(1);
    expect(component.procesoHistoricoTratamientos.value.nombreLote).toBe('Lote 1');
  });

  it('should filter historico tratamientos by lote and date range', () => {
    component.historicoTratamientos = [
      {
        nombre_lote: 'Lote 1',
        diaRegistroTratamiento: new Date('2026-01-01T00:00:00Z'),
      },
      {
        nombre_lote: 'Lote 2',
        diaRegistroTratamiento: new Date('2026-01-01T00:00:00Z'),
      },
    ];
    component.procesoHistoricoTratamientos = new FormControl({
      nombreLote: 'Lote 1',
    }) as any;
    component.range.get('start').setValue(new Date('2025-12-01T00:00:00Z'));
    component.range.get('end').setValue(new Date('2026-12-31T00:00:00Z'));

    component.filtroEstadoHistoricoTratamientos();

    expect(component.estadoHistoricoTratamientos.data.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });
});

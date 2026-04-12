import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { EstadoFitosanitarioComponent } from './estado-fitosanitario.component';

describe('EstadoFitosanitarioComponent', () => {
  let component: EstadoFitosanitarioComponent;
  let fixture: ComponentFixture<EstadoFitosanitarioComponent>;

  beforeEach(async () => {
    spyOn(EstadoFitosanitarioComponent.prototype, 'createChart').and.stub();
    await TestBed.configureTestingModule({
      declarations: [EstadoFitosanitarioComponent],
      providers: [
        {
          provide: LoteService,
          useValue: {
            getLote: () => of({ numero_palmas: 0 }),
            getPalmasLote: () => of([]),
            getEnfermedadesServer: () => of([]),
            getEtapasServer: () => of([]),
          },
        },
        {
          provide: EnfermedadesService,
          useValue: { getEnfermedadesRegistradas: () => of([]) },
        },
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteMock({ queryParams: { lote: 'Lote 1' } }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoFitosanitarioComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should normalize lote names', () => {
    const anyComponent = component as any;
    expect(anyComponent.normalizeLoteName('  Lote%201  ')).toBe('lote 1');
    expect(anyComponent.normalizeLoteName('Lote%')).toBe('lote%');
  });

  it('should build filtered charts by enfermedad and etapas', () => {
    component.registroEnfermedadesLote = [
      {
        nombre_lote: 'Lote 1',
        fecha_registro_enfermedad: '2026-01-01T00:00:00Z',
        nombre_enfermedad: 'rayo',
        etapa_enfermedad: 'inicial',
      },
      {
        nombre_lote: 'Lote 1',
        fecha_registro_enfermedad: '2026-01-02T00:00:00Z',
        nombre_enfermedad: 'rayo',
        etapa_enfermedad: 'avanzado',
      },
    ] as any;
    component.etapasEnfermedades = [
      { nombre_enfermedad: 'rayo', nombre_etapa: 'inicial' },
      { nombre_enfermedad: 'rayo', nombre_etapa: 'avanzado' },
    ] as any;
    component.yearSeleccionado = '2026';
    component.mesSeleccionado = '0';
    component.enfermedadSeleccionada = 'rayo';

    const createChartFiltradoSpy = spyOn(component, 'createChartFiltrado').and.stub();

    component.cambiarChart();

    expect(createChartFiltradoSpy).toHaveBeenCalledWith(
      jasmine.any(Array),
      ['inicial', 'avanzado'],
      true
    );
  });

  it('should build filtered charts without etapas when none are configured', () => {
    component.registroEnfermedadesLote = [
      {
        nombre_lote: 'Lote 1',
        fecha_registro_enfermedad: '2026-01-01T00:00:00Z',
        nombre_enfermedad: 'rayo',
        etapa_enfermedad: 'inicial',
      },
      {
        nombre_lote: 'Lote 1',
        fecha_registro_enfermedad: '2026-01-02T00:00:00Z',
        nombre_enfermedad: 'rayo',
        etapa_enfermedad: 'avanzado',
      },
    ] as any;
    component.etapasEnfermedades = [] as any;
    component.yearSeleccionado = '2026';
    component.mesSeleccionado = '0';
    component.enfermedadSeleccionada = 'rayo';

    const createChartFiltradoSpy = spyOn(component, 'createChartFiltrado').and.stub();

    component.cambiarChart();

    expect(createChartFiltradoSpy).toHaveBeenCalledWith(jasmine.any(Array), ['rayo'], false);
  });

  it('should build the unfiltered chart when no enfermedad is selected', () => {
    component.registroEnfermedadesLote = [
      {
        nombre_lote: 'Lote 1',
        fecha_registro_enfermedad: '2026-01-01T00:00:00Z',
        nombre_enfermedad: 'rayo',
        etapa_enfermedad: 'inicial',
      },
    ] as any;
    component.etapasEnfermedades = [] as any;
    component.yearSeleccionado = 'Todos';
    component.mesSeleccionado = 'Todos';
    component.enfermedadSeleccionada = 'Todas';

    component.cambiarChart();

    expect(component.createChart).toHaveBeenCalledWith(component.registroEnfermedadesLote);
  });

  it('should initialize the empty state message on ngOnInit', () => {
    component.ngOnInit();

    expect(component.estadoCargaMensaje).toBe('No hay registros de enfermedades para este lote.');
    expect(component.totalpalmas).toBe(0);
    expect(component.casosacumulados).toBe(0);
    expect(component.createChart).toHaveBeenCalledWith([]);
  });

  it('should stop early when no lote param is present', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        declarations: [EstadoFitosanitarioComponent],
        providers: [
          {
            provide: LoteService,
            useValue: {
              getLote: jasmine.createSpy('getLote'),
              getPalmasLote: jasmine.createSpy('getPalmasLote'),
              getEnfermedadesServer: jasmine.createSpy('getEnfermedadesServer'),
              getEtapasServer: () => of([]),
            },
          },
          {
            provide: EnfermedadesService,
            useValue: { getEnfermedadesRegistradas: jasmine.createSpy('getEnfermedadesRegistradas') },
          },
          {
            provide: ActivatedRoute,
            useValue: createActivatedRouteMock(),
          },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
      .compileComponents();

    const noParamFixture = TestBed.createComponent(EstadoFitosanitarioComponent);
    const noParamComponent = noParamFixture.componentInstance;

    noParamComponent.ngOnInit();

    expect(noParamComponent.estadoCargaMensaje).toBe('No se recibió el parámetro de lote en la URL.');
  });

  it('should reset the selected year when it is not available', () => {
    component.registroEnfermedadesLote = [
      {
        nombre_lote: 'Lote 1',
        fecha_registro_enfermedad: '2026-01-01T00:00:00Z',
        nombre_enfermedad: 'rayo',
        etapa_enfermedad: 'inicial',
      },
    ] as any;
    component.etapasEnfermedades = [] as any;
    component.yearSeleccionado = '1999';
    component.mesSeleccionado = 'Todos';
    component.enfermedadSeleccionada = 'Todas';

    component.ngOnInit();

    expect(component.yearSeleccionado).toBe('Todos');
  });
});

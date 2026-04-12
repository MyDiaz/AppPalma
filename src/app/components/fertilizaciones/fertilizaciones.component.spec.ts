import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FertilizacionesService } from 'src/app/Servicios/fertilizaciones.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { FertilizacionesComponent } from './fertilizaciones.component';

describe('FertilizacionesComponent', () => {
  let component: FertilizacionesComponent;
  let fixture: ComponentFixture<FertilizacionesComponent>;
  let fertilizacionesServiceSpy: jasmine.SpyObj<FertilizacionesService>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    fertilizacionesServiceSpy = jasmine.createSpyObj('FertilizacionesService', [
      'getFertilizaciones',
      'getFertilizacion',
    ]);
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    fertilizacionesServiceSpy.getFertilizaciones.and.returnValue(of([]));
    fertilizacionesServiceSpy.getFertilizacion.and.returnValue(of([]));
    loteServiceSpy.getLotes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FertilizacionesComponent],
      providers: [
        { provide: FertilizacionesService, useValue: fertilizacionesServiceSpy },
        { provide: LoteService, useValue: loteServiceSpy },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FertilizacionesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter fertilizaciones by lote and state', () => {
    component.ngOnInit();
    component.fertilizaciones = [
      {
        nombre_lote: 'Lote 1',
        inicioFertilizacionDate: new Date('2026-01-01T00:00:00Z'),
        finFertilizacionDate: new Date('2026-01-15T00:00:00Z'),
        estado_fertilizacion: 'ACTIVA',
      },
    ];
    component.estadoFertilizaciones.data = component.fertilizaciones;
    component.procesoFertilizaciones.get('nombreLote').setValue('Lote 1');
    component.procesoFertilizaciones.get('activas').setValue(true);
    component.procesoFertilizaciones.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoFertilizaciones();

    expect(component.estadoFertilizaciones.filteredData.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should load detail rows and format a single record', () => {
    fertilizacionesServiceSpy.getFertilizacion.and.returnValue(
      of({
        fecha_fertilizacion_diaria: '2026-01-05T00:00:00Z',
        nombre_fertilizante: 'Fert 1',
      } as any)
    );

    component.cargarDetalleFertilizacion('fert-1');

    expect(fertilizacionesServiceSpy.getFertilizacion).toHaveBeenCalledWith('fert-1');
    expect(component.detalleFertilizacion.data.length).toBe(1);
    expect(component.mostrarTablaDetalle).toBe(true);
  });

  it('should load and format multiple detail rows', () => {
    fertilizacionesServiceSpy.getFertilizacion.and.returnValue(
      of([
        {
          fecha_fertilizacion_diaria: '2026-01-05T00:00:00Z',
          nombre_fertilizante: 'Fert 1',
        },
        {
          fecha_fertilizacion_diaria: '2026-01-06T00:00:00Z',
          nombre_fertilizante: 'Fert 2',
        },
      ] as any)
    );

    component.cargarDetalleFertilizacion('fert-2');

    expect(component.detalleFertilizacion.data.length).toBe(2);
    expect(component.detalleFertilizacion.data[1].fecha_fertilizacion_diaria).toContain('2026');
  });

  it('should ignore row clicks without an id', () => {
    component.onFertilizacionRowClick({} as any);

    expect(fertilizacionesServiceSpy.getFertilizacion).not.toHaveBeenCalled();
  });

  it('should keep the row detail hidden when an empty response is returned', () => {
    fertilizacionesServiceSpy.getFertilizacion.and.returnValue(of([]));

    component.cargarDetalleFertilizacion('fert-3');

    expect(component.detalleFertilizacion.data.length).toBe(0);
    expect(component.mostrarTablaDetalle).toBe(false);
  });

  it('should mark no results when filters do not match', () => {
    component.ngOnInit();
    component.fertilizaciones = [
      {
        nombre_lote: 'Lote 2',
        inicioFertilizacionDate: new Date('2026-01-01T00:00:00Z'),
        finFertilizacionDate: new Date('2026-01-15T00:00:00Z'),
        estado_fertilizacion: 'FINALIZADA',
      },
    ];
    component.estadoFertilizaciones.data = component.fertilizaciones;
    component.procesoFertilizaciones.get('nombreLote').setValue('Lote 1');
    component.procesoFertilizaciones.get('activas').setValue(true);
    component.procesoFertilizaciones.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoFertilizaciones();

    expect(component.estadoFertilizaciones.filteredData.length).toBe(0);
    expect(component.filtradas).toBe('noEncontro');
  });

  it('should allow both active and finalized states when state filters are empty', () => {
    component.ngOnInit();
    component.fertilizaciones = [
      {
        nombre_lote: 'Lote 1',
        inicioFertilizacionDate: new Date('2026-01-01T00:00:00Z'),
        finFertilizacionDate: new Date('2026-01-15T00:00:00Z'),
        estado_fertilizacion: 'ACTIVA',
      },
      {
        nombre_lote: 'Lote 1',
        inicioFertilizacionDate: new Date('2026-01-01T00:00:00Z'),
        finFertilizacionDate: new Date('2026-01-15T00:00:00Z'),
        estado_fertilizacion: 'FINALIZADA',
      },
    ];
    component.estadoFertilizaciones.data = component.fertilizaciones;
    component.procesoFertilizaciones.get('nombreLote').setValue('Lote 1');
    component.procesoFertilizaciones.get('activas').setValue(false);
    component.procesoFertilizaciones.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoFertilizaciones();

    expect(component.estadoFertilizaciones.filteredData.length).toBe(2);
    expect(component.filtradas).toBe('encontro');
  });

  it('should default the lote filter and load empty data on init', () => {
    component.ngOnInit();

    expect(component.nombreLoteParams).toBeNull();
    expect(component.procesoFertilizaciones.get('nombreLote').value).toBe('TODOS');
    expect(component.estadoFertilizaciones.data).toEqual([]);
  });

  it('should surface a service error from getFertilizaciones', () => {
    fertilizacionesServiceSpy.getFertilizaciones.and.returnValue(
      throwError({ error: { message: 'boom' }, status: 0 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('Servicio no disponible');
  });

  it('should preserve backend error messages when the service is available', () => {
    fertilizacionesServiceSpy.getFertilizaciones.and.returnValue(
      throwError({ error: { message: 'bad request' }, status: 500 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('bad request');
  });

  it('should surface a service error when loading the fertilizacion detail', () => {
    fertilizacionesServiceSpy.getFertilizacion.and.returnValue(
      throwError({ error: { message: 'boom' }, status: 0 })
    );

    component.cargarDetalleFertilizacion('fert-1');

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('Servicio no disponible');
    expect(component.mostrarTablaDetalle).toBe(false);
  });

  it('should ignore null detail ids', () => {
    component.cargarDetalleFertilizacion(null as any);

    expect(fertilizacionesServiceSpy.getFertilizacion).not.toHaveBeenCalled();
  });
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PrecipitacionesService } from 'src/app/Servicios/precipitaciones.service';
import { PrecipitacionComponent } from './precipitacion.component';

describe('PrecipitacionComponent', () => {
  let component: PrecipitacionComponent;
  let fixture: ComponentFixture<PrecipitacionComponent>;
  let serviceSpy: jasmine.SpyObj<PrecipitacionesService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('PrecipitacionesService', ['getPrecipitaciones']);
    serviceSpy.getPrecipitaciones.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PrecipitacionComponent],
      providers: [
        {
          provide: PrecipitacionesService,
          useValue: serviceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecipitacionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should normalize precipitation records and build date ranges', () => {
    const anyComponent = component as any;
    const registros = anyComponent.normalizarPrecipitaciones([
      {
        fecha_registro_precipitacion: '2026-01-02T00:00:00Z',
        cantidad_precipitacion: '12.5',
      },
      { fecha: '2026-01-03T00:00:00Z', milimetros: 3 },
    ]);

    expect(registros.length).toBe(2);
    expect(anyComponent.normalizarPrecipitaciones('not-an-array')).toEqual([]);
    expect(anyComponent.calcularDiasInclusivos(new Date(2026, 0, 1), new Date(2026, 0, 3))).toBe(3);
    expect(anyComponent.normalizarFechaPorGranularidad(new Date(2026, 0, 3), 'mes').getDate()).toBe(1);
    expect(anyComponent.obtenerInicioSemana(new Date(2026, 0, 7)).getDay()).toBe(1);
    expect(anyComponent.avanzarUnidad(new Date(2026, 0, 1), 'semana').getDate()).toBe(8);
    expect(anyComponent.obtenerGranularidadSeleccionada()).toBe('dia');
  });

  it('should handle malformed payloads and reversed ranges', () => {
    const anyComponent = component as any;

    expect(anyComponent.normalizarPrecipitaciones([{ fecha: 'invalid-date', milimetros: 'nope' }])).toEqual([]);
    expect(
      anyComponent.normalizarPrecipitaciones([
        { fecha: '2026-01-02T00:00:00Z', milimetros: 'nope' },
      ])[0].milimetros
    ).toBe(0);

    component.rangeForm.get('start').setValue(new Date(2026, 0, 5));
    component.rangeForm.get('end').setValue(new Date(2026, 0, 1));

    const rango = anyComponent.obtenerRangoActual();

    expect(rango.inicio.getDate()).toBe(1);
    expect(rango.fin.getDate()).toBe(5);
  });

  it('should return default tiles when no range is selected', () => {
    const anyComponent = component as any;
    anyComponent.registrosActuales = [];

    anyComponent.aplicarResumen();

    expect(component.encontro).toBe(false);
    expect(component.rangoSeleccionado).toBe(false);
    expect(component.resumenTiles[0].value).toBe('-- mm');
  });

  it('should calculate summary tiles and chart points for a selected range', () => {
    const anyComponent = component as any;
    anyComponent.registrosActuales = [
      { fecha: new Date(2026, 0, 1), milimetros: 4 },
      { fecha: new Date(2026, 0, 2), milimetros: 0 },
      { fecha: new Date(2026, 0, 3), milimetros: 6 },
    ];
    component.rangeForm.get('start').setValue(new Date(2026, 0, 1));
    component.rangeForm.get('end').setValue(new Date(2026, 0, 3));
    component.rangeForm.get('granularity').setValue('dia');

    const puntos = anyComponent.generarPuntosParaGrafico(
      anyComponent.registrosActuales,
      new Date(2026, 0, 1),
      new Date(2026, 0, 3),
      'dia'
    );

    anyComponent.aplicarResumen();

    expect(component.encontro).toBe(true);
    expect(component.rangoSeleccionado).toBe(true);
    expect(component.resumenTiles[0].value).toBe('10.0 mm');
    expect(component.resumenTiles[1].value).toBe('3.3 mm');
    expect(component.resumenTiles[2].value).toContain('2');
    expect(puntos.map((p: any) => p.y)).toEqual([4, 0, 6]);
  });

  it('should group points by week, month and year granularities', () => {
    const anyComponent = component as any;
    const registros = [
      { fecha: new Date(2026, 0, 5), milimetros: 1 },
      { fecha: new Date(2026, 0, 6), milimetros: 2 },
      { fecha: new Date(2026, 1, 2), milimetros: 3 },
      { fecha: new Date(2027, 0, 4), milimetros: 4 },
    ];

    const semana = anyComponent.generarPuntosParaGrafico(
      registros,
      new Date(2026, 0, 5),
      new Date(2026, 0, 12),
      'semana'
    );
    const mes = anyComponent.generarPuntosParaGrafico(
      registros,
      new Date(2026, 0, 1),
      new Date(2026, 1, 28),
      'mes'
    );
    const anio = anyComponent.generarPuntosParaGrafico(
      registros,
      new Date(2026, 0, 1),
      new Date(2027, 11, 31),
      'anio'
    );

    expect(semana.some((p: any) => p.y > 0)).toBe(true);
    expect(mes.map((p: any) => p.y)).toEqual([3, 3]);
    expect(anio.map((p: any) => p.y)).toEqual([6, 4]);
    expect(anyComponent.normalizarFechaPorGranularidad(new Date(2026, 0, 7), 'semana').getDay()).toBe(1);
    expect(anyComponent.normalizarFechaPorGranularidad(new Date(2026, 0, 7), 'mes').getDate()).toBe(1);
    expect(anyComponent.normalizarFechaPorGranularidad(new Date(2026, 6, 7), 'anio').getMonth()).toBe(0);
    expect(anyComponent.avanzarUnidad(new Date(2026, 0, 1), 'dia').getDate()).toBe(2);
    expect(anyComponent.avanzarUnidad(new Date(2026, 0, 1), 'semana').getDate()).toBe(8);
    expect(anyComponent.avanzarUnidad(new Date(2026, 0, 1), 'mes').getMonth()).toBe(1);
    expect(anyComponent.avanzarUnidad(new Date(2026, 0, 1), 'anio').getFullYear()).toBe(2027);
    expect(anyComponent.obtenerUnidadTiempo('semana')).toBe('week');
    expect(anyComponent.obtenerUnidadTiempo('mes')).toBe('month');
    expect(anyComponent.obtenerUnidadTiempo('anio')).toBe('year');
  });

  it('should update the range label', () => {
    component.rangeForm.get('start').setValue(new Date(2026, 0, 1));
    component.rangeForm.get('end').setValue(new Date(2026, 0, 3));

    expect(component.rangoMostrar).toContain('2026');
  });

  it('should report incomplete range state and service errors', () => {
    component.rangeForm.get('start').setValue(new Date(2026, 0, 1));
    component.rangeForm.get('end').setValue(null);

    expect(component.rangoMostrar).toBe('Completa ambos campos del rango.');

    serviceSpy.getPrecipitaciones.and.returnValue(throwError(() => ({ message: 'boom' })));
    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('No se pudo cargar la información de precipitaciones.');
  });
  it('should cover precipitation fallbacks and chart edge cases', () => {
    const anyComponent = component as any;

    const registros = anyComponent.normalizarPrecipitaciones([
      { fecha: new Date(2026, 0, 1), milimetros: '1' },
      { date: new Date(2026, 0, 2), valor: 2 },
      { dia: new Date(2026, 0, 3), mm: 3 },
      { createdAt: new Date(2026, 0, 4), precipitacion: 4 },
      { fecha: 'invalid-date', milimetros: 'nope' },
    ]);

    expect(registros.map((registro: any) => registro.milimetros)).toEqual([1, 2, 3, 4]);

    component.rangeForm.get('granularity').setValue(null);
    expect(anyComponent.obtenerGranularidadSeleccionada()).toBe('dia');

    component.rangeForm.get('start').setValue(new Date(2026, 0, 1));
    component.rangeForm.get('end').setValue(new Date(2026, 0, 4));
    anyComponent.registrosActuales = registros;
    anyComponent.aplicarResumen();
    expect(component.encontro).toBe(true);

    const chartModule = require('chart.js');
    let capturedConfig: any;
    spyOn(chartModule, 'Chart').and.callFake(function (_ctx: any, config: any) {
      capturedConfig = config;
      return { destroy: jasmine.createSpy('destroy') } as any;
    } as any);
    const canvas = { getContext: jasmine.createSpy('getContext').and.returnValue({}) } as any;
    spyOn(document, 'getElementById').and.returnValue(canvas);

    anyComponent.lluviaChart = null;
    anyComponent.actualizarGraficoPrecipitacion([], 'dia');
    anyComponent.actualizarGraficoPrecipitacion([{ x: new Date(2026, 0, 1), y: 5 }], 'dia');

    const titleCallback = capturedConfig.options.tooltips.callbacks.title;
    expect(titleCallback([undefined as any])).toBe('');
    expect(titleCallback([{ index: 10 }])).toBe('');
    expect(titleCallback([{ index: 0 }])).not.toBe('');
    expect(titleCallback([{ xLabel: 'invalid' }])).toBe('');
    expect(titleCallback([{ xLabel: '2026-01-01T00:00:00Z' }])).not.toBe('');
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should handle missing form controls and empty chart surfaces', () => {
    const anyComponent = component as any;
    const getSpy = spyOn(component.rangeForm, 'get').and.returnValue(null as any);

    expect(anyComponent.obtenerRangoActual()).toBeNull();
    expect(component.rangoMostrar).toContain('Selecciona un rango para ver los indicadores');
    expect(getSpy).toHaveBeenCalledWith('start');
    expect(getSpy).toHaveBeenCalledWith('end');

    spyOn(document, 'getElementById').and.returnValue(null);
    expect(anyComponent.actualizarGraficoPrecipitacion([{ x: new Date(2026, 0, 1), y: 1 }], 'dia')).toBeUndefined();
  });

  it('should ignore chart updates when the canvas context is missing and destroy stale charts for empty datasets', () => {
    const anyComponent = component as any;
    const canvas = {
      getContext: jasmine.createSpy('getContext').and.returnValue(null),
    } as any;
    const getElementSpy = spyOn(document, 'getElementById').and.returnValue(canvas);

    expect(anyComponent.actualizarGraficoPrecipitacion([{ x: new Date(2026, 0, 1), y: 1 }], 'dia')).toBeUndefined();
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    expect(getElementSpy).toHaveBeenCalledWith('chartPrecipitaciones');

    const destroySpy = jasmine.createSpy('destroy');
    anyComponent.lluviaChart = { destroy: destroySpy } as any;
    canvas.getContext.and.returnValue({} as any);

    expect(anyComponent.actualizarGraficoPrecipitacion([], 'dia')).toBeUndefined();
    expect(destroySpy).toHaveBeenCalled();
  });

  it('should build precipitation charts and exercise tooltip branches', () => {
    const anyComponent = component as any;
    const chartModule = require('chart.js');
    let capturedConfig: any;
    const destroySpy = jasmine.createSpy('destroy');
    spyOn(chartModule, 'Chart').and.callFake(function (_ctx: any, config: any) {
      capturedConfig = config;
      return { destroy: destroySpy } as any;
    } as any);

    const canvas = {
      getContext: jasmine.createSpy('getContext').and.returnValue({}),
    } as any;
    spyOn(document, 'getElementById').and.returnValue(canvas);

    anyComponent.lluviaChart = { destroy: jasmine.createSpy('destroy') };

    anyComponent.actualizarGraficoPrecipitacion(
      [{ x: new Date(2026, 0, 1), y: 5 }],
      'mes'
    );

    const titleCallback = capturedConfig.options.tooltips.callbacks.title;
    expect(titleCallback([])).toBe('');
    expect(titleCallback([{ index: 0 }])).not.toBe('');
    expect(titleCallback([{ xLabel: '2026-01-01T00:00:00Z' }])).not.toBe('');

    anyComponent.actualizarGraficoPrecipitacion([], 'dia');

    expect(destroySpy).toHaveBeenCalled();
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
  });
});

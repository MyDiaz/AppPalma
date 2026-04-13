import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { PlateosService } from 'src/app/Servicios/plateos.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { PlateosComponent } from './plateos.component';

describe('PlateosComponent', () => {
  let component: PlateosComponent;
  let fixture: ComponentFixture<PlateosComponent>;
  let plateosServiceSpy: jasmine.SpyObj<PlateosService>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    plateosServiceSpy = jasmine.createSpyObj('PlateosService', ['getPlateos', 'getPlateo']);
    plateosServiceSpy.getPlateos.and.returnValue(of([]));
    plateosServiceSpy.getPlateo.and.returnValue(of([]));
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    loteServiceSpy.getLotes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PlateosComponent],
      providers: [
        { provide: PlateosService, useValue: plateosServiceSpy },
        { provide: LoteService, useValue: loteServiceSpy },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter plateos by lote and state', () => {
    component.ngOnInit();
    component.plateos = [
      {
        nombre_lote: 'Lote 1',
        finPlateoDate: new Date('2026-01-10T00:00:00Z'),
        estado_plateo: 'ACTIVA',
      },
    ];
    component.estadoPlateos.data = component.plateos;
    component.procesoPlateos.get('nombreLote').setValue('Lote 1');
    component.procesoPlateos.get('activas').setValue(true);
    component.procesoPlateos.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoPlateos();

    expect(component.estadoPlateos.filteredData.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should mark no results when filters do not match', () => {
    component.ngOnInit();
    component.plateos = [
      {
        nombre_lote: 'Lote 2',
        finPlateoDate: new Date('2026-01-10T00:00:00Z'),
        estado_plateo: 'FINALIZADA',
      },
    ];
    component.estadoPlateos.data = component.plateos;
    component.procesoPlateos.get('nombreLote').setValue('Lote 1');
    component.procesoPlateos.get('activas').setValue(true);
    component.procesoPlateos.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoPlateos();

    expect(component.estadoPlateos.filteredData.length).toBe(0);
    expect(component.filtradas).toBe('noEncontro');
  });

  it('should load plateo detail and format the daily dates', () => {
    plateosServiceSpy.getPlateo.and.returnValue(
      of([
        {
          fecha_plateo_diario: '2026-02-15T00:00:00Z',
        } as any,
      ])
    );

    component.idBd('123');

    expect(component.detallePlateos.data.length).toBe(1);
    expect(component.detallePlateos.data[0].fecha_plateo_diario).toContain('2026');
    expect(component.mostrarTablaDetalle).toBe(true);
  });

  it('should make the detail table visible even when the row has no records', () => {
    plateosServiceSpy.getPlateo.and.returnValue(of([]));

    component.idBd('123');

    expect(component.detallePlateos.data.length).toBe(0);
    expect(component.mostrarTablaDetalle).toBe(true);
  });

  it('should default the lote filter to TODOS when no query param is present', () => {
    component.ngOnInit();

    expect(component.nombreLoteParams).toBeNull();
    expect(component.procesoPlateos.get('nombreLote').value).toBe('TODOS');
  });

  it('should accept TODOS as an all-lotes filter', () => {
    component.ngOnInit();
    component.plateos = [
      {
        nombre_lote: 'Lote 2',
        finPlateoDate: new Date('2026-01-10T00:00:00Z'),
        estado_plateo: 'FINALIZADA',
      },
    ];
    component.estadoPlateos.data = component.plateos;
    component.procesoPlateos.get('nombreLote').setValue('TODOS');
    component.procesoPlateos.get('activas').setValue(false);
    component.procesoPlateos.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoPlateos();

    expect(component.estadoPlateos.filteredData.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should surface service errors when loading plateos fails', () => {
    plateosServiceSpy.getPlateos.and.returnValue(
      throwError({ error: { message: 'boom' }, status: 0 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('Servicio no disponible.');
  });

  it('should surface backend error messages from getPlateos and getLotes', () => {
    plateosServiceSpy.getPlateos.and.returnValue(
      throwError({ error: { message: 'plateos failed' }, status: 500 })
    );
    loteServiceSpy.getLotes.and.returnValue(
      throwError({ error: { message: 'lotes failed' }, status: 500 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('lotes failed');
  });
});

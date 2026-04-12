import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CosechasService } from 'src/app/Servicios/cosechas.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { CosechasComponent } from './cosechas.component';

describe('CosechasComponent', () => {
  let component: CosechasComponent;
  let fixture: ComponentFixture<CosechasComponent>;
  let cosechasServiceSpy: jasmine.SpyObj<CosechasService>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    cosechasServiceSpy = jasmine.createSpyObj('CosechasService', ['getCosechas', 'getCosecha']);
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    cosechasServiceSpy.getCosechas.and.returnValue(of([]));
    cosechasServiceSpy.getCosecha.and.returnValue(of([]));
    loteServiceSpy.getLotes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CosechasComponent],
      providers: [
        { provide: CosechasService, useValue: cosechasServiceSpy },
        { provide: LoteService, useValue: loteServiceSpy },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CosechasComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter cosechas by lote and state', () => {
    component.ngOnInit();
    component.cosechas = [
      {
        nombre_lote: 'Lote 1',
        finCosechaDate: new Date('2026-01-15T00:00:00Z'),
        inicioCosechaDate: new Date('2026-01-01T00:00:00Z'),
        estado_cosecha: 'ACTIVA',
      },
    ];
    component.estadoCosechas.data = component.cosechas;
    component.procesoCosechas.get('nombreLote').setValue('Lote 1');
    component.procesoCosechas.get('activas').setValue(true);
    component.procesoCosechas.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoCosechas();

    expect(component.estadoCosechas.filteredData.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should load details for a cosecha and format the date', () => {
    cosechasServiceSpy.getCosecha.and.returnValue(
      of([
        {
          fecha_cosecha: '2026-01-15T00:00:00Z',
        } as any,
      ])
    );

    component.idBd('cosecha-1');

    expect(cosechasServiceSpy.getCosecha).toHaveBeenCalledWith('cosecha-1');
    expect(component.detalleCosecha.data[0].fecha_cosecha).toContain('2026');
    expect(component.mostrarTablaDetalle).toBe(true);
  });

  it('should mark no results when filters do not match', () => {
    component.ngOnInit();
    component.cosechas = [
      {
        nombre_lote: 'Lote 2',
        finCosechaDate: new Date('2026-01-10T00:00:00Z'),
        inicioCosechaDate: new Date('2026-01-01T00:00:00Z'),
        estado_cosecha: 'FINALIZADA',
      },
    ];
    component.estadoCosechas.data = component.cosechas;
    component.procesoCosechas.get('nombreLote').setValue('Lote 1');
    component.procesoCosechas.get('activas').setValue(true);
    component.procesoCosechas.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoCosechas();

    expect(component.estadoCosechas.filteredData.length).toBe(0);
    expect(component.filtradas).toBe('noEncontro');
  });

  it('should allow both active and finalized states when the state filters are empty', () => {
    component.ngOnInit();
    component.cosechas = [
      {
        nombre_lote: 'Lote 1',
        finCosechaDate: new Date('2026-01-10T00:00:00Z'),
        inicioCosechaDate: new Date('2026-01-01T00:00:00Z'),
        estado_cosecha: 'ACTIVA',
      },
      {
        nombre_lote: 'Lote 1',
        finCosechaDate: new Date('2026-01-12T00:00:00Z'),
        inicioCosechaDate: new Date('2026-01-02T00:00:00Z'),
        estado_cosecha: 'FINALIZADA',
      },
    ];
    component.estadoCosechas.data = component.cosechas;
    component.procesoCosechas.get('nombreLote').setValue('Lote 1');
    component.procesoCosechas.get('activas').setValue(false);
    component.procesoCosechas.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoCosechas();

    expect(component.estadoCosechas.filteredData.length).toBe(2);
    expect(component.filtradas).toBe('encontro');
  });

  it('should default the lote filter when the route has no lote param', () => {
    component.ngOnInit();

    expect(component.nombreLoteParams).toBeNull();
    expect(component.procesoCosechas.get('nombreLote').value).toBe('TODOS');
  });

  it('should surface a service error from getCosechas', () => {
    cosechasServiceSpy.getCosechas.and.returnValue(
      throwError({ error: { message: 'boom' }, status: 0 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('Servicio no disponible');
  });

  it('should format cosechas and open the detalle view when loading by id', () => {
    cosechasServiceSpy.getCosecha.and.returnValue(
      of([
        {
          fecha_cosecha: '2026-01-15T00:00:00Z',
          cantidad_racimos_dia: 4,
        } as any,
      ])
    );

    component.idBd('cosecha-2');

    expect(cosechasServiceSpy.getCosecha).toHaveBeenCalledWith('cosecha-2');
    expect(component.detalleCosecha.data[0].fecha_cosecha).toContain('2026');
    expect(component.mostrarTablaDetalle).toBe(true);
  });
});

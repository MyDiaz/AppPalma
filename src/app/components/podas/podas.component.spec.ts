import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { PodasService } from 'src/app/Servicios/podas.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { PodasComponent } from './podas.component';

describe('PodasComponent', () => {
  let component: PodasComponent;
  let fixture: ComponentFixture<PodasComponent>;
  let podasServiceSpy: jasmine.SpyObj<PodasService>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    podasServiceSpy = jasmine.createSpyObj('PodasService', ['getPodas', 'getPoda']);
    podasServiceSpy.getPodas.and.returnValue(of([]));
    podasServiceSpy.getPoda.and.returnValue(of([]));
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    loteServiceSpy.getLotes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PodasComponent],
      providers: [
        { provide: PodasService, useValue: podasServiceSpy },
        { provide: LoteService, useValue: loteServiceSpy },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PodasComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter podas by lote and state', () => {
    component.ngOnInit();
    component.podas = [
      {
        nombre_lote: 'Lote 1',
        finPodaDate: new Date('2026-01-10T00:00:00Z'),
        estado_poda: 'ACTIVA',
      },
    ];
    component.estadoPodas.data = component.podas;
    component.procesoPodas.get('nombreLote').setValue('Lote 1');
    component.procesoPodas.get('activas').setValue(true);
    component.procesoPodas.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoPodas();

    expect(component.estadoPodas.filteredData.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should mark no results when filters do not match', () => {
    component.ngOnInit();
    component.podas = [
      {
        nombre_lote: 'Lote 2',
        finPodaDate: new Date('2026-01-10T00:00:00Z'),
        estado_poda: 'FINALIZADA',
      },
    ];
    component.estadoPodas.data = component.podas;
    component.procesoPodas.get('nombreLote').setValue('Lote 1');
    component.procesoPodas.get('activas').setValue(true);
    component.procesoPodas.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoPodas();

    expect(component.estadoPodas.filteredData.length).toBe(0);
    expect(component.filtradas).toBe('noEncontro');
  });

  it('should load poda detail and format the daily dates', () => {
    podasServiceSpy.getPoda.and.returnValue(
      of([
        {
          fecha_poda_diaria: '2026-02-15T00:00:00Z',
        } as any,
      ])
    );

    component.idBd('123');

    expect(component.detallePoda.data.length).toBe(1);
    expect(component.detallePoda.data[0].fecha_poda_diaria).toContain('2026');
    expect(component.mostrarTablaDetalle).toBe(true);
  });

  it('should make the detail table visible even when the row has no records', () => {
    podasServiceSpy.getPoda.and.returnValue(of([]));

    component.idBd('123');

    expect(component.detallePoda.data.length).toBe(0);
    expect(component.mostrarTablaDetalle).toBe(true);
  });

  it('should default the lote filter to TODOS when no query param is present', () => {
    component.ngOnInit();

    expect(component.nombreLoteParams).toBeNull();
    expect(component.procesoPodas.get('nombreLote').value).toBe('TODOS');
  });

  it('should accept TODOS as an all-lotes filter', () => {
    component.ngOnInit();
    component.podas = [
      {
        nombre_lote: 'Lote 2',
        finPodaDate: new Date('2026-01-10T00:00:00Z'),
        estado_poda: 'FINALIZADA',
      },
    ];
    component.estadoPodas.data = component.podas;
    component.procesoPodas.get('nombreLote').setValue('TODOS');
    component.procesoPodas.get('activas').setValue(false);
    component.procesoPodas.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoPodas();

    expect(component.estadoPodas.filteredData.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should surface service errors when loading podas fails', () => {
    podasServiceSpy.getPodas.and.returnValue(
      throwError({ error: { message: 'boom' }, status: 0 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('Servicio no disponible.');
  });

  it('should surface backend error messages from getPodas and getLotes', () => {
    podasServiceSpy.getPodas.and.returnValue(
      throwError({ error: { message: 'podas failed' }, status: 500 })
    );
    loteServiceSpy.getLotes.and.returnValue(
      throwError({ error: { message: 'lotes failed' }, status: 500 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('lotes failed');
  });
});

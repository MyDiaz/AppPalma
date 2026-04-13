import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ErradicacionesService } from 'src/app/Servicios/erradicaciones.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { ErradicacionesComponent } from './erradicaciones.component';

describe('ErradicacionesComponent', () => {
  let component: ErradicacionesComponent;
  let fixture: ComponentFixture<ErradicacionesComponent>;
  let lotesSpy: jasmine.SpyObj<LoteService>;
  let erradicacionesSpy: jasmine.SpyObj<ErradicacionesService>;

  beforeEach(async () => {
    lotesSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    erradicacionesSpy = jasmine.createSpyObj('ErradicacionesService', ['getErradicaciones']);
    lotesSpy.getLotes.and.returnValue(of([]));
    erradicacionesSpy.getErradicaciones.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ErradicacionesComponent],
      providers: [
        DatePipe,
        { provide: LoteService, useValue: lotesSpy },
        { provide: ErradicacionesService, useValue: erradicacionesSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ErradicacionesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter erradicaciones by lote', () => {
    component.erradicaciones = [
      {
        nombre_lote: 'Lote 1',
        fecha_erradicacion: '2026-01-10T00:00:00Z',
      },
    ];
    component.procesoErradicaciones.get('nombreLote').setValue('Lote 1');
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoErradicaciones();

    expect(component.estadoErradicaciones.data.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should load erradicaciones and append the TODOS lote', () => {
    erradicacionesSpy.getErradicaciones.and.returnValue(
      of([
        {
          nombre_lote: 'Lote 1',
          fecha_erradicacion: '2026-01-10T00:00:00Z',
        } as any,
      ])
    );

    component.ngOnInit();

    expect(component.erradicaciones[0].fecha_presentacion).toContain('2026');
    expect(component.lotes.some((lote) => lote.nombre_lote === 'TODOS')).toBe(true);
    expect(component.cargando).toBe(false);
  });

  it('should not duplicate the TODOS lote if the API already returns it', () => {
    lotesSpy.getLotes.and.returnValue(
      of([{ nombre_lote: 'TODOS' } as any, { nombre_lote: 'Lote 1' } as any])
    );

    component.ngOnInit();

    expect(component.lotes.filter((lote) => lote.nombre_lote === 'TODOS').length).toBe(1);
  });

  it('should mark no results and keep the table empty when filters do not match', () => {
    component.erradicaciones = [
      {
        nombre_lote: 'Lote 2',
        fecha_erradicacion: '2026-01-10T00:00:00Z',
      },
    ];
    component.procesoErradicaciones.get('nombreLote').setValue('Lote 1');
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoErradicaciones();

    expect(component.estadoErradicaciones.data.length).toBe(0);
    expect(component.filtradas).toBe('noEncontro');
  });

  it('should accept TODOS as an all-lotes filter', () => {
    component.erradicaciones = [
      {
        nombre_lote: 'Lote 2',
        fecha_erradicacion: '2026-01-10T00:00:00Z',
      },
    ];
    component.procesoErradicaciones.get('nombreLote').setValue('TODOS');
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoErradicaciones();

    expect(component.estadoErradicaciones.data.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should set filterApplied when a real filter is used', () => {
    component.erradicaciones = [
      {
        nombre_lote: 'Lote 1',
        fecha_erradicacion: '2026-01-10T00:00:00Z',
      },
    ];

    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));
    component.procesoErradicaciones.get('nombreLote').setValue('Lote 1');

    component.filtroEstadoErradicaciones();

    expect(component.filterApplied).toBe(true);
  });

  it('should call submit through the current filter path', () => {
    spyOn(component, 'filtroEstadoErradicaciones');

    component.submit();

    expect(component.filtroEstadoErradicaciones).toHaveBeenCalled();
  });

  it('should surface service errors when loading data', () => {
    erradicacionesSpy.getErradicaciones.and.returnValue(
      throwError({ error: {}, status: 0 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('Servicio no disponible');
  });

  it('should keep backend error messages when the API is reachable', () => {
    erradicacionesSpy.getErradicaciones.and.returnValue(
      throwError({ error: { message: 'bad request' }, status: 500 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('bad request');
  });
});

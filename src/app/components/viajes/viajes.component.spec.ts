import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { ViajesService } from 'src/app/Servicios/viajes.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { ViajesComponent } from './viajes.component';

describe('ViajesComponent', () => {
  let component: ViajesComponent;
  let fixture: ComponentFixture<ViajesComponent>;
  let viajesSpy: jasmine.SpyObj<ViajesService>;
  let lotesSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    viajesSpy = jasmine.createSpyObj('ViajesService', ['getViajes']);
    lotesSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    viajesSpy.getViajes.and.returnValue(of([]));
    lotesSpy.getLotes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ViajesComponent],
      providers: [
        { provide: ViajesService, useValue: viajesSpy },
        { provide: LoteService, useValue: lotesSpy },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViajesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and format viajes on init', () => {
    viajesSpy.getViajes.and.returnValue(
      of([
        {
          fecha_viaje: '2026-01-10T00:00:00Z',
        } as any,
      ])
    );

    component.ngOnInit();

    expect(component.viajes[0].fecha_viaje).toContain('2026');
    expect(component.viajes[0].diaViajeDate instanceof Date).toBe(true);
    expect(component.cargando).toBe(false);
  });

  it('should filter viajes by date', () => {
    component.viajes = [
      {
        diaViajeDate: new Date('2026-01-10T00:00:00Z'),
      },
    ];
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoViajes();

    expect(component.estadoViaje.data.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });

  it('should mark no results when the date range excludes all viajes', () => {
    component.viajes = [
      {
        diaViajeDate: new Date('2026-01-10T00:00:00Z'),
      },
    ];
    component.range.get('start').setValue(new Date('2026-02-01'));
    component.range.get('end').setValue(new Date('2026-02-28'));

    component.filtroEstadoViajes();

    expect(component.estadoViaje.data.length).toBe(0);
    expect(component.filtradas).toBe('noEncontro');
  });

  it('should surface a service error on init', () => {
    viajesSpy.getViajes.and.returnValue(
      throwError({ error: { message: 'boom' }, status: 0 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('Servicio no disponible');
  });

  it('should preserve backend error messages when the API is reachable', () => {
    viajesSpy.getViajes.and.returnValue(
      throwError({ error: { message: 'bad request' }, status: 500 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('bad request');
  });

  it('should keep all viajes visible when no date filters are set', () => {
    component.viajes = [
      {
        diaViajeDate: new Date('2026-01-10T00:00:00Z'),
      },
      {
        diaViajeDate: new Date('2026-02-10T00:00:00Z'),
      },
    ];

    component.filtroEstadoViajes();

    expect(component.estadoViaje.data.length).toBe(2);
    expect(component.filtradas).toBe('encontro');
  });
});

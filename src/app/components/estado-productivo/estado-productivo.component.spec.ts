import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CensosProductivosService } from 'src/app/Servicios/censos-productivos.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { EstadoProductivoComponent } from './estado-productivo.component';

describe('EstadoProductivoComponent', () => {
  let component: EstadoProductivoComponent;
  let fixture: ComponentFixture<EstadoProductivoComponent>;
  let censosProductivosServiceSpy: jasmine.SpyObj<CensosProductivosService>;

  beforeEach(async () => {
    spyOn(EstadoProductivoComponent.prototype, 'createChart').and.stub();
    censosProductivosServiceSpy = jasmine.createSpyObj('CensosProductivosService', [
      'getCensosProductivosLote',
    ]);
    censosProductivosServiceSpy.getCensosProductivosLote.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [EstadoProductivoComponent],
      providers: [
        DatePipe,
        {
          provide: CensosProductivosService,
          useValue: censosProductivosServiceSpy,
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
    fixture = TestBed.createComponent(EstadoProductivoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format dates for reports', () => {
    expect(component.formatDateTime(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('should filter and aggregate censo data by period', () => {
    const anyComponent = component as any;
    const rows = [
      {
        fecha_registro_censo_productivo: new Date(2026, 0, 1),
        cantidad_flores_femeninas: 1,
        cantidad_flores_masculinas: 2,
        cantidad_racimos_verdes: 3,
        cantidad_racimos_pintones: 4,
        cantidad_racimos_sobremaduros: 5,
        cantidad_racimos_maduros: 6,
      },
      {
        fecha_registro_censo_productivo: new Date(2026, 1, 1),
        cantidad_flores_femeninas: 10,
        cantidad_flores_masculinas: 20,
        cantidad_racimos_verdes: 30,
        cantidad_racimos_pintones: 40,
        cantidad_racimos_sobremaduros: 50,
        cantidad_racimos_maduros: 60,
      },
    ];

    component.yearSeleccionado = '2026';
    component.mesSeleccionado = '0';

    expect(anyComponent.filtrarCensosPorPeriodo(rows).length).toBe(1);
    expect(anyComponent.calcularTotales(rows).get('Flores Femeninas')).toBe(11);
    expect(anyComponent.calcularTotales([]).get('Racimos Verdes')).toBe(0);
  });

  it('should load the lote censos on init', () => {
    component.ngOnInit();

    expect(component.nombreLoteParams).toBe('Lote 1');
    expect(component.censoProductivo.length).toBe(0);
    expect(component.createChart).toHaveBeenCalled();
  });

  it('should handle an error response from the service', () => {
    censosProductivosServiceSpy.getCensosProductivosLote.and.returnValue(
      throwError(() => new Error('boom'))
    );
    const consoleSpy = spyOn(console, 'error');

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalled();
    expect(component.censoProductivo).toBeUndefined();
  });
});

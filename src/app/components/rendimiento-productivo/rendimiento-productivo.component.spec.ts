import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CensosProductivosService } from 'src/app/Servicios/censos-productivos.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { RendimientoProductivoComponent } from './rendimiento-productivo.component';

describe('RendimientoProductivoComponent', () => {
  let component: RendimientoProductivoComponent;
  let fixture: ComponentFixture<RendimientoProductivoComponent>;
  let censosProductivosServiceSpy: jasmine.SpyObj<CensosProductivosService>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    spyOn(RendimientoProductivoComponent.prototype, 'createChart').and.stub();
    censosProductivosServiceSpy = jasmine.createSpyObj('CensosProductivosService', [
      'getCensosProductivosMinYear',
      'getCensosProductivos',
    ]);
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    censosProductivosServiceSpy.getCensosProductivosMinYear.and.returnValue(of({ min_year: 2020 }));
    censosProductivosServiceSpy.getCensosProductivos.and.returnValue(of([]));
    loteServiceSpy.getLotes.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      declarations: [RendimientoProductivoComponent],
      providers: [
        DatePipe,
        {
          provide: CensosProductivosService,
          useValue: censosProductivosServiceSpy,
        },
        { provide: LoteService, useValue: loteServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RendimientoProductivoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter chart data and format dates', () => {
    const anyComponent = component as any;
    const rows = [
      {
        nombre_lote: 'Lote 1',
        fecha_registro_censo_productivo: new Date(2026, 0, 1),
        cantidad_flores_femeninas: 1,
        cantidad_flores_masculinas: 2,
        cantidad_racimos_verdes: 3,
        cantidad_racimos_pintones: 4,
        cantidad_racimos_sobremaduros: 5,
        cantidad_racimos_maduros: 6,
      },
    ];

    component.censoProductivo = rows as any;
    component.yearSeleccionado = '2026';
    component.loteSeleccionado = 'Lote 1';
    component.mesSeleccionado = 'Todos';

    expect(component.chartFilter(rows[0] as any)).toBe(true);
    expect(anyComponent.aggregateChartData(rows as any).get('Flores Femeninas')).toBe(1);
    expect(component.formatDateTime(new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(anyComponent.matchesYearMonth(rows[0] as any)).toBe(true);
  });

  it('should filter by lote, year and month', () => {
    component.yearSeleccionado = '2026';
    component.mesSeleccionado = '0';
    component.loteSeleccionado = 'Lote 1';

    expect(
      component.chartFilter({
        nombre_lote: 'Lote 1',
        fecha_registro_censo_productivo: new Date(2026, 0, 1),
      } as any)
    ).toBe(true);

    expect(
      component.chartFilter({
        nombre_lote: 'Lote 2',
        fecha_registro_censo_productivo: new Date(2026, 0, 1),
      } as any)
    ).toBe(false);

    component.loteSeleccionado = 'Todos';
    component.yearSeleccionado = 'Todos';
    component.mesSeleccionado = 'Todos';
    expect(
      (component as any).matchesYearMonth({
        fecha_registro_censo_productivo: new Date(2025, 11, 31),
      })
    ).toBe(true);
  });

  it('should aggregate missing values as zero', () => {
    const anyComponent = component as any;
    const totals = anyComponent.aggregateChartData([
      { cantidad_flores_femeninas: 2 },
      { cantidad_flores_femeninas: undefined, cantidad_racimos_maduros: 5 },
    ]);

    expect(totals.get('Flores Femeninas')).toBe(2);
    expect(totals.get('Racimos Maduros')).toBe(5);
    expect(totals.get('Racimos Verdes')).toBe(0);
  });

  it('should initialize years and fall back when the min year request fails', () => {
    component.ngOnInit();

    expect(component.lotes).toEqual([]);
    expect(component.years[0]).toBe(2020);

    censosProductivosServiceSpy.getCensosProductivos.and.returnValue(
      of([
        {
          nombre_lote: 'Lote 1',
          fecha_registro_censo_productivo: new Date(2026, 0, 1),
        } as any,
      ])
    );
    loteServiceSpy.getLotes.and.returnValue(of([{ nombre_lote: 'Lote 1' } as any]));

    component = TestBed.createComponent(RendimientoProductivoComponent).componentInstance;
    component.ngOnInit();

    expect(component.lotes.length).toBe(1);
    expect(component.censoProductivo.length).toBe(1);

    censosProductivosServiceSpy.getCensosProductivosMinYear.and.returnValue(
      throwError(() => new Error('boom'))
    );
    component = TestBed.createComponent(RendimientoProductivoComponent).componentInstance;
    component.ngOnInit();

    expect(component.years[0]).toBe(2000);
  });

  it('should map month names and unknown months', () => {
    const anyComponent = component as any;

    expect(anyComponent.getMonthName(0)).toBe('Enero');
    expect(anyComponent.getMonthName(11)).toBe('Diciembre');
    expect(anyComponent.getMonthName(99)).toBe('Mes desconocido');
  });
});

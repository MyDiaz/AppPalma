import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CensosProductivosService } from 'src/app/Servicios/censos-productivos.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { RendimientoProductivoComponent } from './rendimiento-productivo.component';

describe('RendimientoProductivoComponent', () => {
  let component: RendimientoProductivoComponent;
  let fixture: ComponentFixture<RendimientoProductivoComponent>;

  beforeEach(async () => {
    spyOn(RendimientoProductivoComponent.prototype, 'createChart').and.stub();
    await TestBed.configureTestingModule({
      declarations: [RendimientoProductivoComponent],
      providers: [
        DatePipe,
        {
          provide: CensosProductivosService,
          useValue: {
            getCensosProductivosMinYear: () => of({ min_year: 2020 }),
            getCensosProductivos: () => of([]),
          },
        },
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
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
  });
});

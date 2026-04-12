import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FertilizacionesService } from 'src/app/Servicios/fertilizaciones.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { FertilizacionesComponent } from './fertilizaciones.component';

describe('FertilizacionesComponent', () => {
  let component: FertilizacionesComponent;
  let fixture: ComponentFixture<FertilizacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FertilizacionesComponent],
      providers: [
        {
          provide: FertilizacionesService,
          useValue: {
            getFertilizaciones: () => of([]),
            getFertilizacion: () => of([]),
          },
        },
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
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
});

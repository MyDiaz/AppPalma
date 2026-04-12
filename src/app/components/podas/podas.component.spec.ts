import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { PodasService } from 'src/app/Servicios/podas.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { PodasComponent } from './podas.component';

describe('PodasComponent', () => {
  let component: PodasComponent;
  let fixture: ComponentFixture<PodasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PodasComponent],
      providers: [
        {
          provide: PodasService,
          useValue: {
            getPodas: () => of([]),
            getPoda: () => of([]),
          },
        },
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
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
});

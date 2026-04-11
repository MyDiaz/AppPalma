import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CosechasService } from 'src/app/Servicios/cosechas.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { CosechasComponent } from './cosechas.component';

describe('CosechasComponent', () => {
  let component: CosechasComponent;
  let fixture: ComponentFixture<CosechasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CosechasComponent],
      providers: [
        {
          provide: CosechasService,
          useValue: {
            getCosechas: () => of([]),
            getCosecha: () => of([]),
          },
        },
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
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
});

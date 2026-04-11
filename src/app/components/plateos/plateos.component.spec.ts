import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { PlateosService } from 'src/app/Servicios/plateos.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { PlateosComponent } from './plateos.component';

describe('PlateosComponent', () => {
  let component: PlateosComponent;
  let fixture: ComponentFixture<PlateosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PlateosComponent],
      providers: [
        {
          provide: PlateosService,
          useValue: {
            getPlateos: () => of([]),
            getPlateo: () => of([]),
          },
        },
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter plateos by lote and state', () => {
    component.ngOnInit();
    component.plateos = [
      {
        nombre_lote: 'Lote 1',
        finPlateoDate: new Date('2026-01-10T00:00:00Z'),
        estado_plateo: 'ACTIVA',
      },
    ];
    component.estadoPlateos.data = component.plateos;
    component.procesoPlateos.get('nombreLote').setValue('Lote 1');
    component.procesoPlateos.get('activas').setValue(true);
    component.procesoPlateos.get('finalizadas').setValue(false);
    component.range.get('start').setValue(new Date('2025-12-01'));
    component.range.get('end').setValue(new Date('2026-12-31'));

    component.filtroEstadoPlateos();

    expect(component.estadoPlateos.filteredData.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });
});

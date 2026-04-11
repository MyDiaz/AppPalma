import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { CensosService } from 'src/app/Servicios/censos.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { CensosComponent } from './censos.component';

describe('CensosComponent', () => {
  let component: CensosComponent;
  let fixture: ComponentFixture<CensosComponent>;
  let censosServiceSpy: jasmine.SpyObj<CensosService>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    censosServiceSpy = jasmine.createSpyObj('CensosService', ['getCensos']);
    censosServiceSpy.getCensos.and.returnValue(
      of([
        {
          nombre_lote: 'Lote 1',
          fecha_censo: '2026-01-01T00:00:00Z',
          nombre_comun_plaga: 'plaga',
          nombre_etapa_plaga: 'etapa',
          numero_individuos: 1,
          estado_censo: 'fumigado',
          observacion_censo: 'OBS',
        },
      ])
    );
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    loteServiceSpy.getLotes.and.returnValue(of([{ nombre_lote: 'Lote 1' } as any]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CensosComponent],
      providers: [
        { provide: CensosService, useValue: censosServiceSpy },
        { provide: LoteService, useValue: loteServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteMock({ queryParams: { lote: 'Lote 1' } }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensosComponent);
    component = fixture.componentInstance;
  });

  it('should create and load censos', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(component.censos.length).toBe(1);
    expect(component.procesoCensos.value.nombreLote).toBe('Lote 1');
  });

  it('should filter censos by lote and state', () => {
    component.censos = [
      {
        nombre_lote: 'Lote 1',
        fechaCenso: new Date('2026-01-01T00:00:00Z'),
        estado_censo: 'FUMIGADO',
      },
    ];
    component.procesoCensos = new FormControl({
      nombreLote: 'Lote 1',
      fumigado: true,
      eliminado: false,
      pend_fumigar: false,
    }) as any;
    component.range.get('start').setValue(new Date('2025-12-01T00:00:00Z'));
    component.range.get('end').setValue(new Date('2026-12-31T00:00:00Z'));

    component.filtroEstadoCensos();

    expect(component.estadoCensos.data.length).toBe(1);
    expect(component.filtradas).toBe('encontro');
  });
});

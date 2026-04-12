import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CensosProductivosService } from 'src/app/Servicios/censos-productivos.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { EstadoProductivoComponent } from './estado-productivo.component';

describe('EstadoProductivoComponent', () => {
  let component: EstadoProductivoComponent;
  let fixture: ComponentFixture<EstadoProductivoComponent>;

  beforeEach(async () => {
    spyOn(EstadoProductivoComponent.prototype, 'createChart').and.stub();
    await TestBed.configureTestingModule({
      declarations: [EstadoProductivoComponent],
      providers: [
        DatePipe,
        {
          provide: CensosProductivosService,
          useValue: { getCensosProductivosLote: () => of([]) },
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

  it('should load the lote censos on init', () => {
    component.ngOnInit();

    expect(component.nombreLoteParams).toBe('Lote 1');
    expect(component.censoProductivo.length).toBe(0);
    expect(component.createChart).toHaveBeenCalled();
  });
});

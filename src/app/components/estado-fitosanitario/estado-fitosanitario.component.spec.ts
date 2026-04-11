import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { EstadoFitosanitarioComponent } from './estado-fitosanitario.component';

describe('EstadoFitosanitarioComponent', () => {
  let component: EstadoFitosanitarioComponent;
  let fixture: ComponentFixture<EstadoFitosanitarioComponent>;

  beforeEach(async () => {
    spyOn(EstadoFitosanitarioComponent.prototype, 'createChart').and.stub();
    await TestBed.configureTestingModule({
      declarations: [EstadoFitosanitarioComponent],
      providers: [
        {
          provide: LoteService,
          useValue: {
            getLote: () => of({ numero_palmas: 0 }),
            getPalmasLote: () => of([]),
            getEnfermedadesServer: () => of([]),
            getEtapasServer: () => of([]),
          },
        },
        {
          provide: EnfermedadesService,
          useValue: { getEnfermedadesRegistradas: () => of([]) },
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
    fixture = TestBed.createComponent(EstadoFitosanitarioComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

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
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { ViajesService } from 'src/app/Servicios/viajes.service';
import { CensoProductivoComponent } from './censo-productivo.component';

describe('CensoProductivoComponent', () => {
  let component: CensoProductivoComponent;
  let fixture: ComponentFixture<CensoProductivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CensoProductivoComponent],
      providers: [
        { provide: ViajesService, useValue: { getCensoProductivo: () => of([]) } },
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensoProductivoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load censo productivo and lotes', () => {
    component.ngOnInit();

    expect(component.censos_productivos).toEqual([]);
    expect(component.lotes).toEqual([]);
  });
});

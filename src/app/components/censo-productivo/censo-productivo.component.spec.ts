import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { ViajesService } from 'src/app/Servicios/viajes.service';
import { CensoProductivoComponent } from './censo-productivo.component';

describe('CensoProductivoComponent', () => {
  let component: CensoProductivoComponent;
  let fixture: ComponentFixture<CensoProductivoComponent>;
  let viajesServiceSpy: jasmine.SpyObj<ViajesService>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;

  beforeEach(async () => {
    viajesServiceSpy = jasmine.createSpyObj('ViajesService', [
      'getCensoProductivo',
    ]);
    viajesServiceSpy.getCensoProductivo.and.returnValue(of([]));
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    loteServiceSpy.getLotes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [CensoProductivoComponent],
      providers: [
        { provide: ViajesService, useValue: viajesServiceSpy },
        { provide: LoteService, useValue: loteServiceSpy },
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

  it('should set the error flag when loading censos fails', () => {
    viajesServiceSpy.getCensoProductivo.and.returnValue(
      throwError({ error: { message: 'boom' }, status: 0 })
    );

    component.ngOnInit();

    expect(component.bandera_error).toBe(true);
    expect(component.mensaje_error).toBe('Servicio no disponible');
  });
});

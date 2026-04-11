import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { PrecipitacionesService } from 'src/app/Servicios/precipitaciones.service';
import { PrecipitacionComponent } from './precipitacion.component';

describe('PrecipitacionComponent', () => {
  let component: PrecipitacionComponent;
  let fixture: ComponentFixture<PrecipitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PrecipitacionComponent],
      providers: [
        {
          provide: PrecipitacionesService,
          useValue: { getPrecipitaciones: () => of([]) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecipitacionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should normalize precipitation records and build date ranges', () => {
    const anyComponent = component as any;
    const registros = anyComponent.normalizarPrecipitaciones([
      {
        fecha_registro_precipitacion: '2026-01-02T00:00:00Z',
        cantidad_precipitacion: '12.5',
      },
      { fecha: '2026-01-03T00:00:00Z', milimetros: 3 },
    ]);

    expect(registros.length).toBe(2);
    expect(anyComponent.calcularDiasInclusivos(new Date(2026, 0, 1), new Date(2026, 0, 3))).toBe(3);
    expect(anyComponent.normalizarFechaPorGranularidad(new Date(2026, 0, 3), 'mes').getDate()).toBe(1);
    expect(anyComponent.obtenerInicioSemana(new Date(2026, 0, 7)).getDay()).toBe(1);
    expect(anyComponent.avanzarUnidad(new Date(2026, 0, 1), 'semana').getDate()).toBe(8);
  });

  it('should update the range label', () => {
    component.rangeForm.get('start').setValue(new Date(2026, 0, 1));
    component.rangeForm.get('end').setValue(new Date(2026, 0, 3));

    expect(component.rangoMostrar).toContain('2026');
  });
});

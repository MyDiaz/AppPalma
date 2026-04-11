import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import { createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { ListadoEnfermedadesComponent } from './listado-enfermedades.component';

describe('ListadoEnfermedadesComponent', () => {
  let component: ListadoEnfermedadesComponent;
  let fixture: ComponentFixture<ListadoEnfermedadesComponent>;
  let enfermedadesServiceSpy: jasmine.SpyObj<EnfermedadesService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    enfermedadesServiceSpy = jasmine.createSpyObj('EnfermedadesService', [
      'getEnfermedadesEtapas',
      'getEnfermedades',
      'eliminarEnfermedad',
    ]);
    enfermedadesServiceSpy.getEnfermedadesEtapas.and.returnValue(
      of([{ nombre_enfermedad: 'Rayo', etapa_enfermedad: 'Inicial' }])
    );
    enfermedadesServiceSpy.getEnfermedades.and.returnValue(
      of([{ nombre_enfermedad: 'Marchitez' }])
    );
    enfermedadesServiceSpy.eliminarEnfermedad.and.returnValue(
      of({ message: 'ok' })
    );
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ListadoEnfermedadesComponent],
      providers: [
        { provide: EnfermedadesService, useValue: enfermedadesServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoEnfermedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load enfermedades', () => {
    expect(component).toBeTruthy();
    expect(component.hayEnfermedadesEtapas).toBe(true);
    expect(component.hayEnfermedades).toBe(true);
  });

  it('should edit and validate the selected enfermedad', () => {
    component.NombreEnfermedadForm = new FormControl({
      nombre_enfermedad: 'enfermedad-Rayo',
    }) as any;

    expect(component.esValido()).toBe(true);
    component.editarEnfermedad();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['editar-enfermedad', 'Rayo']);
  });

  it('should delete the selected enfermedad after confirmation', fakeAsync(() => {
    component.NombreEnfermedadForm = new FormControl({
      nombre_enfermedad: 'enfermedad-Rayo',
    }) as any;
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.eliminarEnfermedad();
    tick();
    tick();

    expect(enfermedadesServiceSpy.eliminarEnfermedad).toHaveBeenCalledWith('Rayo');
    expect(enfermedadesServiceSpy.getEnfermedadesEtapas).toHaveBeenCalledTimes(2);
    expect(enfermedadesServiceSpy.getEnfermedades).toHaveBeenCalledTimes(2);
  }));
});

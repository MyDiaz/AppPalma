import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import { createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { FormularioEnfermedadComponent } from './formulario-enfermedad.component';

describe('FormularioEnfermedadComponent', () => {
  let component: FormularioEnfermedadComponent;
  let fixture: ComponentFixture<FormularioEnfermedadComponent>;
  let enfermedadesServiceSpy: jasmine.SpyObj<EnfermedadesService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    enfermedadesServiceSpy = jasmine.createSpyObj('EnfermedadesService', [
      'postEnfermedad',
      'postEnfermedadEtapas',
    ]);
    enfermedadesServiceSpy.postEnfermedad.and.returnValue(of({ message: 'ok' }));
    enfermedadesServiceSpy.postEnfermedadEtapas.and.returnValue(of({ message: 'ok' }));
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FormularioEnfermedadComponent],
      providers: [
        { provide: EnfermedadesService, useValue: enfermedadesServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioEnfermedadComponent);
    component = fixture.componentInstance;
  });

  it('should create and manage dynamic etapa rows', () => {
    expect(component).toBeTruthy();
    const etapasIniciales = component.etapasEnfermedad.length;

    component.addEtapa();
    component.addTratamientoEtapa();

    expect(component.etapasEnfermedad.length).toBe(etapasIniciales + 1);
    expect(component.TratamientoEtapaEnfermedad.length).toBe(etapasIniciales + 1);
  });

  it('should remove the last dynamic row when possible', () => {
    component.addEtapa();
    component.addTratamientoEtapa();

    component.borrarFila();

    expect(component.etapasEnfermedad.length).toBe(1);
    expect(component.TratamientoEtapaEnfermedad.length).toBe(1);
  });

  it('should create a simple enfermedad after confirmation', fakeAsync(() => {
    component.NuevaEnfermedadForm.setValue({
      nombre_enfermedad: 'Rayo',
      procedimiento_tratamiento_enfermedad: 'Tratamiento largo',
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.guardarEnfermedad();
    tick();
    tick();

    expect(enfermedadesServiceSpy.postEnfermedad).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('listado-enfermedad');
  }));
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import { createActivatedRouteMock, createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { EditarEnfermedadComponent } from './editar-enfermedad.component';

describe('EditarEnfermedadComponent', () => {
  let component: EditarEnfermedadComponent;
  let fixture: ComponentFixture<EditarEnfermedadComponent>;
  let enfermedadesServiceSpy: jasmine.SpyObj<EnfermedadesService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    enfermedadesServiceSpy = jasmine.createSpyObj('EnfermedadesService', [
      'getEnfermedad',
      'putEnfermedad',
    ]);
    enfermedadesServiceSpy.getEnfermedad.and.returnValue(
      of({
        nombre_enfermedad: 'Rayo',
        procedimiento_tratamiento_enfermedad: 'Tratamiento largo',
      })
    );
    enfermedadesServiceSpy.putEnfermedad.and.returnValue(of({ message: 'ok' }));
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EditarEnfermedadComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteMock({ params: { nombre_enfermedad: 'Rayo' } }),
        },
        { provide: EnfermedadesService, useValue: enfermedadesServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarEnfermedadComponent);
    component = fixture.componentInstance;
  });

  it('should create and preload the enfermedad', () => {
    expect(component).toBeTruthy();
    expect(enfermedadesServiceSpy.getEnfermedad).toHaveBeenCalledWith('Rayo');
    expect(component.editaEnfermedadForm.value.nombre_enfermedad).toBe('Rayo');
  });

  it('should update the enfermedad after confirmation', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.editaEnfermedadForm.setValue({
      nombre_enfermedad: 'Rayo',
      procedimiento_tratamiento_enfermedad: 'Tratamiento largo',
    });

    component.guardar();
    tick();
    tick();

    expect(enfermedadesServiceSpy.putEnfermedad).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('listado-enfermedad');
  }));
});

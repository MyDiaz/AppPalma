import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import { createActivatedRouteMock, createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { EditarEtapaEnfermedadComponent } from './editar-etapa-enfermedad.component';

describe('EditarEtapaEnfermedadComponent', () => {
  let component: EditarEtapaEnfermedadComponent;
  let fixture: ComponentFixture<EditarEtapaEnfermedadComponent>;
  let enfermedadesServiceSpy: jasmine.SpyObj<EnfermedadesService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    enfermedadesServiceSpy = jasmine.createSpyObj('EnfermedadesService', [
      'getEnfermedadEtapas',
      'actualizarEnfermedadConEtapas',
    ]);
    enfermedadesServiceSpy.getEnfermedadEtapas.and.returnValue(
      of([
        {
          id_etapa_enfermedad: 1,
          etapa_enfermedad: 'Inicial',
          nombre_enfermedad: 'Rayo',
          tratamiento_etapa_enfermedad: 'Tratamiento',
          fue_borrado: false,
        },
      ])
    );
    enfermedadesServiceSpy.actualizarEnfermedadConEtapas.and.returnValue(
      of({ message: 'ok' })
    );
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EditarEtapaEnfermedadComponent],
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
    fixture = TestBed.createComponent(EditarEtapaEnfermedadComponent);
    component = fixture.componentInstance;
  });

  it('should create and build the form from existing etapas', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(component.cargando).toBe(true);
    expect(component.IDsEnfermedad.length).toBe(1);
  });

  it('should update enfermedad etapas after confirmation', fakeAsync(() => {
    component.ngOnInit();
    component.editarEnfermedadEtapaForm.setValue({
      ids_etapas_enfermedad: [1],
      nombre_enfermedad: 'Rayo',
      etapas_enfermedad: ['Inicial'],
      tratamientos_etapa_enfermedad: ['Tratamiento'],
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.actualizarEnfermedad();
    tick();
    tick();

    expect(enfermedadesServiceSpy.actualizarEnfermedadConEtapas).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('listado-enfermedad');
  }));

  it('should add rows, keep one row on delete, and surface update errors', fakeAsync(() => {
    component.ngOnInit();
    component.addEtapa();
    component.borrarFila(1);

    expect(component.IDsEnfermedad.length).toBe(1);
    expect(component.etapasEnfermedad.length).toBe(1);
    expect(component.tratamientosEtapa.length).toBe(1);

    enfermedadesServiceSpy.actualizarEnfermedadConEtapas.and.returnValue(
      throwError({ error: { message: 'boom' } })
    );
    component.editarEnfermedadEtapaForm.setValue({
      ids_etapas_enfermedad: [1],
      nombre_enfermedad: 'Rayo',
      etapas_enfermedad: ['Inicial'],
      tratamientos_etapa_enfermedad: ['Tratamiento'],
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.actualizarEnfermedad();
    tick();
    tick();

    expect(enfermedadesServiceSpy.actualizarEnfermedadConEtapas).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  }));
});

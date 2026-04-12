import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PlagasService } from 'src/app/Servicios/plagas.service';
import { createActivatedRouteMock, createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { NuevaPlagaComponent } from './nueva-plaga.component';

describe('NuevaPlagaComponent', () => {
  let component: NuevaPlagaComponent;
  let fixture: ComponentFixture<NuevaPlagaComponent>;
  let plagasServiceSpy: jasmine.SpyObj<PlagasService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    plagasServiceSpy = jasmine.createSpyObj('PlagasService', [
      'getPlaga',
      'postPlaga',
      'putPlaga',
    ]);
    plagasServiceSpy.getPlaga.and.returnValue(of([]));
    plagasServiceSpy.postPlaga.and.returnValue(of({ message: 'ok' }));
    plagasServiceSpy.putPlaga.and.returnValue(of({ message: 'ok' }));
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [NuevaPlagaComponent],
      providers: [
        { provide: PlagasService, useValue: plagasServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaPlagaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.hayPlaga).toBe(false);
  });

  it('should mark the edit branch and surface constructor errors', async () => {
    const errorSpy = jasmine.createSpyObj('PlagasService', ['getPlaga']);
    errorSpy.getPlaga.and.returnValue(throwError(() => 'boom'));
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [NuevaPlagaComponent],
        providers: [
          { provide: PlagasService, useValue: errorSpy },
          { provide: Router, useValue: createRouterSpy() },
          {
            provide: ActivatedRoute,
            useValue: createActivatedRouteMock({
              params: { nombre_comun_plaga: 'Plaga 1' },
            }),
          },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
      .compileComponents();

    const errorFixture = TestBed.createComponent(NuevaPlagaComponent);
    const errorComponent = errorFixture.componentInstance;

    expect(errorComponent.hayPlaga).toBeTruthy();
    expect(errorComponent.bandera).toBeTruthy();
  });

  it('should add rows to the dynamic form', () => {
    const etapasIniciales = component.etapasPlaga.length;

    component.addEtapa();
    component.addProcedimientoEtapa();

    expect(component.etapasPlaga.length).toBe(etapasIniciales + 1);
    expect(component.ProcedimientoEtapasPlaga.length).toBe(etapasIniciales + 1);
  });

  it('should expose validation and branch helpers', () => {
    component.nombrePlaga = 'Plaga 1';
    component.plagaEditar = [];
    component.crearFormularioPlagas();
    component.NuevaPlagaForm.get('nombre_comun_plaga').markAsTouched();
    component.NuevaPlagaForm.get('nombre_comun_plaga').setErrors({ required: true });

    expect(component.nombreEnfermedadEtapasNoValido).toBe(true);

    component.borrarFila();
    component.addID();
    expect(component.IDsPlaga.length).toBe(1);
  });

  it('should create a plaga after confirmation', fakeAsync(() => {
    component.NuevaPlagaForm.setValue({
      nombre_comun_plaga: 'Plaga 1',
      nombre_etapa_plaga: ['Etapa 1'],
      procedimiento_etapa_plaga: ['Tratamiento largo'],
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.guardarPlaga();
    tick();
    tick();

    expect(plagasServiceSpy.postPlaga).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('listado-plagas');
  }));

  it('should not create a plaga when confirmation is rejected', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: false } as any)
    );

    component.NuevaPlagaForm.setValue({
      nombre_comun_plaga: 'Plaga 1',
      nombre_etapa_plaga: ['Etapa 1'],
      procedimiento_etapa_plaga: ['Tratamiento largo'],
    });

    component.guardarPlaga();
    tick();

    expect(plagasServiceSpy.postPlaga).not.toHaveBeenCalled();
  }));

  it('should update a plaga and keep the form helpers working', fakeAsync(() => {
    component.nombrePlaga = 'Plaga 1';
    component.plagaEditar = [
      {
        id_etapa_plaga: 1,
        nombre_etapa_plaga: 'Etapa 1',
        procedimiento_etapa_plaga: 'Tratamiento',
      },
    ];
    component.crearFormularioPlagas();
    component.NuevaPlagaForm.setValue({
      ids_etapas_plaga: [1],
      nombre_comun_plaga: 'Plaga 1',
      nombre_etapa_plaga: ['Etapa 1'],
      procedimiento_etapa_plaga: ['Tratamiento'],
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.addID();
    component.borrarFila();
    component.actualizarPlaga();
    tick();
    tick();

    expect(plagasServiceSpy.putPlaga).toHaveBeenCalledWith(
      jasmine.objectContaining({
        nombre_comun_plaga: 'Plaga%201',
      }),
      'Plaga 1'
    );
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('listado-plagas');
  }));

  it('should not update a plaga when confirmation is rejected', fakeAsync(() => {
    component.nombrePlaga = 'Plaga 1';
    component.plagaEditar = [
      {
        id_etapa_plaga: 1,
        nombre_etapa_plaga: 'Etapa 1',
        procedimiento_etapa_plaga: 'Tratamiento',
      },
    ];
    component.crearFormularioPlagas();
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: false } as any)
    );

    component.actualizarPlaga();
    tick();

    expect(plagasServiceSpy.putPlaga).not.toHaveBeenCalled();
  }));
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
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

  it('should add rows to the dynamic form', () => {
    const etapasIniciales = component.etapasPlaga.length;

    component.addEtapa();
    component.addProcedimientoEtapa();

    expect(component.etapasPlaga.length).toBe(etapasIniciales + 1);
    expect(component.ProcedimientoEtapasPlaga.length).toBe(etapasIniciales + 1);
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
});

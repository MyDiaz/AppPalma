import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AgroquimicosService } from 'src/app/Servicios/agroquimicos.service';
import { createActivatedRouteMock, createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { NuevoAgroquimicosComponent } from './nuevo-agroquimicos.component';

describe('NuevoAgroquimicosComponent', () => {
  let component: NuevoAgroquimicosComponent;
  let fixture: ComponentFixture<NuevoAgroquimicosComponent>;
  let agroquimicosServiceSpy: jasmine.SpyObj<AgroquimicosService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    agroquimicosServiceSpy = jasmine.createSpyObj('AgroquimicosService', [
      'getAgroquimico',
      'postAgroquimico',
      'actualizarAgroquimico',
    ]);
    agroquimicosServiceSpy.getAgroquimico.and.returnValue(
      of({
        nombre_producto_agroquimico: 'Producto',
        tipo_producto_agroquimico: 'Tipo',
        clase_producto: 'Clase',
        presentacion_producto_agroquimico: 'Caja',
        ingrediente_activo_producto_agroquimico: 'Activo',
        periodo_carencia_producto_agroquimico: '7',
      })
    );
    agroquimicosServiceSpy.postAgroquimico.and.returnValue(
      of({ message: 'ok' })
    );
    agroquimicosServiceSpy.actualizarAgroquimico.and.returnValue(
      of({ message: 'ok' })
    );
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [NuevoAgroquimicosComponent],
      providers: [
        { provide: AgroquimicosService, useValue: agroquimicosServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoAgroquimicosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a product after confirmation', fakeAsync(() => {
    component.agroquimicoForm.setValue({
      nombre_producto_agroquimico: 'Producto',
      tipo_producto_agroquimico: 'Tipo',
      clase_producto: 'Clase',
      presentacion_producto_agroquimico: 'Caja',
      ingrediente_activo_producto_agroquimico: 'Activo',
      periodo_carencia_producto_agroquimico: '7',
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.guardar();
    tick();
    tick();

    expect(agroquimicosServiceSpy.postAgroquimico).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('listado-agroquimicos');
  }));
});

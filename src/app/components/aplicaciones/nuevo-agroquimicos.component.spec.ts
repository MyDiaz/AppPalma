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

  it('should expose validation flags and update an existing product', fakeAsync(() => {
    component.agroquimicoForm.get('nombre_producto_agroquimico').markAsTouched();
    component.agroquimicoForm.get('tipo_producto_agroquimico').markAsTouched();
    component.agroquimicoForm.get('clase_producto').markAsTouched();
    component.agroquimicoForm.get('presentacion_producto_agroquimico').markAsTouched();
    component.agroquimicoForm.get('ingrediente_activo_producto_agroquimico').markAsTouched();
    component.agroquimicoForm.get('periodo_carencia_producto_agroquimico').markAsTouched();

    expect(component.nombreProductoAgroquimicoNoValido).toBeTruthy();
    expect(component.tipoProductoAgroquimicoNoValido).toBeTruthy();
    expect(component.claseProductoNoValido).toBeTruthy();
    expect(component.presentacionProductoAgroquimicoNoValido).toBeTruthy();
    expect(component.ingredienteActivoProductoAgroquimicoNoValido).toBeTruthy();
    expect(component.periodoCarenciaProductoAgroquimicoNoValido).toBeTruthy();

    component.IDAgroquimico = '1';
    component.hayProducto = true;
    component.agroquimicoAEditar = {
      nombre_producto_agroquimico: 'Producto 1',
      tipo_producto_agroquimico: 'Tipo 1',
      clase_producto: 'Clase 1',
      presentacion_producto_agroquimico: 'Caja',
      ingrediente_activo_producto_agroquimico: 'Activo 1',
      periodo_carencia_producto_agroquimico: '7',
    };
    component.crearFormularioAgroquímicos();
    component.agroquimicoForm.setValue({
      nombre_producto_agroquimico: 'Producto 1',
      tipo_producto_agroquimico: 'Tipo 1',
      clase_producto: 'Clase 1',
      presentacion_producto_agroquimico: 'Caja',
      ingrediente_activo_producto_agroquimico: 'Activo 1',
      periodo_carencia_producto_agroquimico: '7',
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.actualizarProducto();
    tick();
    tick();

    expect(agroquimicosServiceSpy.actualizarAgroquimico).toHaveBeenCalledWith(
      '1',
      jasmine.objectContaining({
        nombre_producto_agroquimico: 'Producto%201',
        tipo_producto_agroquimico: 'Tipo%201',
      })
    );
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('listado-agroquimicos');
    expect(component.regresar).toBeDefined();
  }));
});

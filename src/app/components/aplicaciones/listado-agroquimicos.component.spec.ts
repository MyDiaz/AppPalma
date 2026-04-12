import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AgroquimicosService } from 'src/app/Servicios/agroquimicos.service';
import { createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { ListadoAgroquimicosComponent } from './listado-agroquimicos.component';

describe('ListadoAgroquimicosComponent', () => {
  let component: ListadoAgroquimicosComponent;
  let fixture: ComponentFixture<ListadoAgroquimicosComponent>;
  let agroquimicosServiceSpy: jasmine.SpyObj<AgroquimicosService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    agroquimicosServiceSpy = jasmine.createSpyObj('AgroquimicosService', [
      'getAgroquimicos',
      'eliminarAgroquimico',
    ]);
    agroquimicosServiceSpy.getAgroquimicos.and.returnValue(
      of([{ tipo_producto_agroquimico: 'Fungicida', id_producto_agroquimico: '1' }])
    );
    agroquimicosServiceSpy.eliminarAgroquimico.and.returnValue(
      of({ message: 'ok' })
    );
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ListadoAgroquimicosComponent],
      providers: [
        { provide: AgroquimicosService, useValue: agroquimicosServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoAgroquimicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load agroquimicos', () => {
    expect(component).toBeTruthy();
    expect(component.hayProducto).toBe(true);
    expect(component.agroquimicos.length).toBe(1);
  });

  it('should validate and navigate to edit page', () => {
    component.NombreAgroquimicoForm = new FormControl({
      id_producto_agroquimico: '1',
    }) as any;

    expect(component.esValido()).toBe(true);
    component.editarAgroquimico();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['nuevo-agroquimico', '1']);
  });

  it('should keep validation false when no product is selected', () => {
    component.NombreAgroquimicoForm = new FormControl({
      id_producto_agroquimico: null,
    }) as any;

    expect(component.esValido()).toBe(false);
  });

  it('should mark the service as unavailable when the request fails', () => {
    agroquimicosServiceSpy.getAgroquimicos.and.returnValue(
      throwError({ error: { mensaje: 'boom' }, status: 0 })
    );

    component.cargarAgroquimicos();

    expect(component.bandera).toBe(true);
    expect(component.mensajeError).toBe('Servicio no disponible');
  });

  it('should delete the selected agroquimico after confirmation', fakeAsync(() => {
    component.NombreAgroquimicoForm = new FormControl({
      id_producto_agroquimico: '1',
      nombre_comun_plaga: 'Plaga 1',
    }) as any;
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.eliminarAgroquimico();
    tick();
    tick();

    expect(agroquimicosServiceSpy.eliminarAgroquimico).toHaveBeenCalledWith('1');
    expect(agroquimicosServiceSpy.getAgroquimicos).toHaveBeenCalledTimes(2);
  }));

  it('should not delete when confirmation is rejected', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: false } as any)
    );
    component.NombreAgroquimicoForm = new FormControl({
      id_producto_agroquimico: '1',
      nombre_comun_plaga: 'Plaga 1',
    }) as any;

    component.eliminarAgroquimico();
    tick();

    expect(agroquimicosServiceSpy.eliminarAgroquimico).not.toHaveBeenCalled();
  }));
});

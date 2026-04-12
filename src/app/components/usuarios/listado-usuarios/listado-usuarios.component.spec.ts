import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';
import { createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { ListadoUsuariosComponent } from './listado-usuarios.component';

describe('ListadoUsuariosComponent', () => {
  let component: ListadoUsuariosComponent;
  let fixture: ComponentFixture<ListadoUsuariosComponent>;
  let usuariosServiceSpy: jasmine.SpyObj<UsuariosService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    usuariosServiceSpy = jasmine.createSpyObj('UsuariosService', [
      'getUsuarios',
      'deshabilitarUsuario',
      'habilitarUsuario',
    ]);
    usuariosServiceSpy.getUsuarios.and.returnValue(of([]));
    usuariosServiceSpy.deshabilitarUsuario.and.returnValue(of({ message: 'ok' } as any));
    usuariosServiceSpy.habilitarUsuario.and.returnValue(of({ message: 'ok' } as any));
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      declarations: [ListadoUsuariosComponent],
      providers: [
        { provide: UsuariosService, useValue: usuariosServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoUsuariosComponent);
    component = fixture.componentInstance;
  });

  it('should load users and detect when there are results', () => {
    usuariosServiceSpy.getUsuarios.and.returnValue(
      of([{ cc_usuario: '1', validado: true } as any])
    );

    component.ngOnInit();

    expect(component.usuarios.length).toBe(1);
    expect(component.hayUsuarios).toBe(true);
  });

  it('should keep the table empty when there are no users', () => {
    component.ngOnInit();

    expect(component.usuarios).toEqual([]);
    expect(component.hayUsuarios).toBe(false);
  });

  it('should surface backend errors and service unavailable state', () => {
    usuariosServiceSpy.getUsuarios.and.returnValue(
      throwError({ error: { mensaje: 'boom' }, status: 0 })
    );

    component.ngOnInit();

    expect(component.bandera).toBe(true);
    expect(component.mensajeError).toBe('Servicio no disponible');
  });

  it('should navigate to create and edit screens', () => {
    component.nuevoUsuario();
    component.editarUsuario('123');

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('nuevo-usuario');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('editar-usuario/123');
  });

  it('should disable a user and update the local list', fakeAsync(() => {
    component.usuarios = [{ cc_usuario: '123', validado: true } as any];
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({} as any)
    );

    component.deshabilitarUsuario('123');
    tick();
    tick();

    expect(usuariosServiceSpy.deshabilitarUsuario).toHaveBeenCalledWith('123');
    expect(component.usuarios[0].validado).toBe(false);
  }));

  it('should enable a user and update the local list', fakeAsync(() => {
    component.usuarios = [{ cc_usuario: '123', validado: false } as any];
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({} as any)
    );

    component.habilitarUsuario('123');
    tick();
    tick();

    expect(usuariosServiceSpy.habilitarUsuario).toHaveBeenCalledWith('123');
    expect(component.usuarios[0].validado).toBe(true);
  }));

  it('should show an error when disabling fails', () => {
    usuariosServiceSpy.deshabilitarUsuario.and.returnValue(
      throwError({})
    );

    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));

    component.deshabilitarUsuario('123');

    expect(Swal.fire).toHaveBeenCalled();
  });
});

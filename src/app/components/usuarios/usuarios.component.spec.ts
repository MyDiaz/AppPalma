import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/Servicios/auth.service';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';
import {
  createAuthServiceStub,
  createNgbModalSpy,
  createRouterSpy,
} from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { UsuariosComponent } from './usuarios.component';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;
  let authStub: any;
  let usuariosServiceSpy: jasmine.SpyObj<UsuariosService>;
  let modalSpy: jasmine.SpyObj<NgbModal>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authStub = createAuthServiceStub({
      getIdUsuario: jasmine.createSpy('getIdUsuario').and.returnValue('1001'),
    });
    usuariosServiceSpy = jasmine.createSpyObj('UsuariosService', [
      'getUsuario',
      'updateProfile',
      'changePassword',
    ]);
    usuariosServiceSpy.getUsuario.and.returnValue(
      of({
        cc_usuario: '1001',
        nombre_usuario: 'Usuario Prueba',
        telefono: '3000000000',
        correo: 'test@example.com',
        rol: 'admin',
        cargo_empresa: 'Administrador',
      })
    );
    usuariosServiceSpy.updateProfile.and.returnValue(
      of({ nombre_usuario: 'Usuario Prueba', message: 'ok' } as any)
    );
    usuariosServiceSpy.changePassword.and.returnValue(of({ message: 'ok' }));
    modalSpy = createNgbModalSpy();
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [UsuariosComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerSpy },
        { provide: UsuariosService, useValue: usuariosServiceSpy },
        { provide: NgbModal, useValue: modalSpy },
        FormBuilder,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
  });

  it('should load the user and build both forms', () => {
    component.ngOnInit();

    expect(authStub.getIdUsuario).toHaveBeenCalled();
    expect(usuariosServiceSpy.getUsuario).toHaveBeenCalledWith('1001');
    expect(component.usuario.nombre_usuario).toBe('Usuario Prueba');
    expect(component.actualizarUsuarioForm.get('nombre_usuario').value).toBe('Usuario Prueba');
    expect(component.cambiarContrasenaForm.get('contrasena_actual')).toBeTruthy();
  });

  it('should stop when no user id is available', () => {
    authStub.getIdUsuario.and.returnValue(null);

    component.ngOnInit();

    expect(usuariosServiceSpy.getUsuario).not.toHaveBeenCalled();
    expect(component.cargando).toBe(false);
  });

  it('should expose validation helpers for both forms', () => {
    component.actualizarUsuarioForm = new FormBuilder().group({
      nombre_usuario: ['x'],
      telefono: ['3000000000'],
      correo: ['test@example.com'],
    });
    component.actualizarUsuarioForm.get('nombre_usuario').markAsTouched();
    component.actualizarUsuarioForm.get('nombre_usuario').setErrors({ required: true });

    component.cambiarContrasenaForm = new FormBuilder().group({
      contrasena_actual: ['12345678'],
      contrasena_nueva: ['short'],
    });
    component.cambiarContrasenaForm.get('contrasena_nueva').markAsTouched();
    component.cambiarContrasenaForm.get('contrasena_nueva').setErrors({ minlength: true });

    expect(component.nombreUsuarioNoValido).toBe(true);
    expect(component.contrasenaUsuarioNoValido).toBe(true);
  });

  it('should update the profile on success', () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
    component.usuario = { nombre_usuario: 'Usuario Prueba' };
    component.actualizarUsuarioForm = new FormBuilder().group({
      nombre_usuario: 'Usuario Nuevo',
      telefono: '3000000001',
      correo: 'nuevo@example.com',
    });

    component.actualizarUsuario();

    expect(usuariosServiceSpy.updateProfile).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should surface profile update errors', () => {
    usuariosServiceSpy.updateProfile.and.returnValue(
      throwError({ error: { message: 'boom' } })
    );
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
    component.usuario = { nombre_usuario: 'Usuario Prueba' };
    component.actualizarUsuarioForm = new FormBuilder().group({
      nombre_usuario: 'Usuario Nuevo',
      telefono: '3000000001',
      correo: 'nuevo@example.com',
    });

    component.actualizarUsuario();

    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should change password and close the modal', () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
    component.usuario = { nombre_usuario: 'Usuario Prueba' };
    component.cambiarContrasenaForm = new FormBuilder().group({
      contrasena_actual: '12345678',
      contrasena_nueva: '87654321',
    });

    component.cambiarContrasena();

    expect(usuariosServiceSpy.changePassword).toHaveBeenCalled();
    expect(modalSpy.dismissAll).toHaveBeenCalledWith('Submit successful');
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should surface password change errors', () => {
    usuariosServiceSpy.changePassword.and.returnValue(
      throwError({ error: { message: 'boom' } })
    );
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
    component.usuario = { nombre_usuario: 'Usuario Prueba' };
    component.cambiarContrasenaForm = new FormBuilder().group({
      contrasena_actual: '12345678',
      contrasena_nueva: '87654321',
    });

    component.cambiarContrasena();

    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should open the modal through the NgbModal service', fakeAsync(() => {
    component.openCambiarContrasena('content');
    tick();

    expect(modalSpy.open).toHaveBeenCalled();
  }));
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/Servicios/auth.service';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';
import {
  createActivatedRouteMock,
  createAuthServiceStub,
  createRouterSpy,
} from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { RegistroComponent } from './registro.component';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  let usuariosServiceSpy: jasmine.SpyObj<UsuariosService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: any;

  beforeEach(async () => {
    activatedRouteMock = createActivatedRouteMock();
    usuariosServiceSpy = jasmine.createSpyObj('UsuariosService', [
      'getUsuario',
      'updateUsuario',
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
    usuariosServiceSpy.updateUsuario.and.returnValue(of({ message: 'ok' }));
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegistroComponent],
      providers: [
        { provide: AuthService, useValue: createAuthServiceStub() },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: UsuariosService, useValue: usuariosServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.NuevoUserForm.get('cargo_empresa').value).toBe('cargo');
    expect(component.NuevoUserForm.get('rol').value).toBe('rol');
  });

  it('should load user data when editing an existing user', () => {
    activatedRouteMock.paramMap = of(convertToParamMap({ cc_usuario: '1001' }));

    component.ngOnInit();

    expect(component.usuarioNuevo).toBe(false);
    expect(component.NuevoUserForm.get('cc_usuario').value).toBe('1001');
    expect(component.cargando).toBe(false);
  });

  it('should warn when the form is invalid', () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));

    component.guardar();

    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should flag invalid fields through the getter helpers', () => {
    component.NuevoUserForm.get('cc_usuario').setValue('1');
    component.NuevoUserForm.get('cc_usuario').markAsTouched();
    component.NuevoUserForm.get('contrasena_usuario').setValue('123');
    component.NuevoUserForm.get('contrasena_usuario').markAsTouched();

    expect(component.ccUsuarioNoValido).toBe(true);
    expect(component.contrasenaUsuarioNoValido).toBe(true);
  });

  it('should expose the remaining validation helpers', () => {
    component.NuevoUserForm.get('nombre_usuario').markAsTouched();
    component.NuevoUserForm.get('nombre_usuario').setErrors({ required: true });
    component.NuevoUserForm.get('telefono').markAsTouched();
    component.NuevoUserForm.get('telefono').setErrors({ required: true });
    component.NuevoUserForm.get('rol').markAsTouched();
    component.NuevoUserForm.get('rol').setErrors({ pattern: true });
    component.NuevoUserForm.get('correo').setErrors({ email: true });
    component.NuevoUserForm.get('cargo_empresa').markAsTouched();
    component.NuevoUserForm.get('cargo_empresa').setErrors({ pattern: true });

    expect(component.nombreUsuarioNoValido).toBe(true);
    expect(component.telefonoNoValido).toBe(true);
    expect(component.rolNoValido).toBe(true);
    expect(component.emailNoValido).toBe(true);
    expect(component.cargoNoValido).toBe(true);
  });

  it('should treat password branches differently for new and existing users', () => {
    component.usuarioNuevo = true;
    component.NuevoUserForm.get('contrasena_usuario').setValue(null);
    expect(component.contrasenaUsuarioNoValido).toBe(true);

    component.NuevoUserForm.get('contrasena_usuario').setValue('1234567');
    component.NuevoUserForm.get('contrasena_usuario').markAsTouched();
    expect(component.contrasenaUsuarioNoValido).toBe(true);

    component.usuarioNuevo = false;
    component.NuevoUserForm.get('contrasena_usuario').setValue('1234567');
    expect(component.contrasenaUsuarioNoValido).toBe(true);

    component.NuevoUserForm.get('contrasena_usuario').setValue(null);
    expect(component.contrasenaUsuarioNoValido).toBe(false);
  });

  it('should register a new user when confirmed', fakeAsync(() => {
    component.NuevoUserForm.setValue({
      cc_usuario: '1001001',
      nombre_usuario: 'Usuario Nuevo',
      telefono: '3000000000',
      correo: 'nuevo@example.com',
      rol: 'admin',
      cargo_empresa: 'Administrador',
      contrasena_usuario: '12345678',
    });
    component.usuarioNuevo = true;
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    const registrarSpy = spyOn(component, 'registrarUsuarioNuevo').and.stub();
    component.guardar();
    tick();

    expect(registrarSpy).toHaveBeenCalled();
  }));

  it('should not register when confirmation is rejected', fakeAsync(() => {
    component.NuevoUserForm.setValue({
      cc_usuario: '1001001',
      nombre_usuario: 'Usuario Nuevo',
      telefono: '3000000000',
      correo: 'nuevo@example.com',
      rol: 'admin',
      cargo_empresa: 'Administrador',
      contrasena_usuario: '12345678',
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: false } as any)
    );

    const registrarSpy = spyOn(component, 'registrarUsuarioNuevo').and.stub();
    component.guardar();
    tick();

    expect(registrarSpy).not.toHaveBeenCalled();
  }));

  it('should update an existing user when confirmed', fakeAsync(() => {
    component.usuarioNuevo = false;
    component.ccUsuario = '1001';
    component.NuevoUserForm.setValue({
      cc_usuario: '1001001',
      nombre_usuario: 'Usuario Editado',
      telefono: '3000000000',
      correo: 'editado@example.com',
      rol: 'admin',
      cargo_empresa: 'Administrador',
      contrasena_usuario: null,
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    const updateSpy = spyOn(component, 'updateUsuario').and.stub();
    component.guardar();
    tick();

    expect(updateSpy).toHaveBeenCalled();
  }));

  it('should surface registration errors', () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
    component.registrarUsuarioNuevo({ nombre_usuario: 'Usuario' } as any);

    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should surface update errors', () => {
    usuariosServiceSpy.updateUsuario.and.returnValue(
      throwError({ error: { message: 'boom' } })
    );
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
    component.ccUsuario = '1001';
    component.updateUsuario({ nombre_usuario: 'Usuario' } as any);

    expect(Swal.fire).toHaveBeenCalled();
  });
});

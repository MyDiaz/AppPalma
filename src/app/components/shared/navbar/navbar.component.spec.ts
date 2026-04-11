import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from 'src/app/Servicios/auth.service';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';
import {
  createAuthServiceStub,
  createRouterSpy,
} from 'src/testing/spec-helpers';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceStub: any;
  let routerSpy: jasmine.SpyObj<Router>;
  let usuariosServiceSpy: jasmine.SpyObj<UsuariosService>;

  beforeEach(async () => {
    authServiceStub = createAuthServiceStub({
      getIdUsuario: jasmine.createSpy().and.returnValue('1001'),
      cerrarSesion: jasmine.createSpy('cerrarSesion'),
    });
    routerSpy = createRouterSpy();
    usuariosServiceSpy = jasmine.createSpyObj('UsuariosService', ['getUsuario']);
    usuariosServiceSpy.getUsuario.and.returnValue(
      of({ cc_usuario: '1001', nombre_usuario: 'Usuario Prueba' } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: Router, useValue: routerSpy },
        { provide: UsuariosService, useValue: usuariosServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create and load the user', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(authServiceStub.getIdUsuario).toHaveBeenCalled();
    expect(usuariosServiceSpy.getUsuario).toHaveBeenCalledWith('1001');
    expect(component.usuario.nombre_usuario).toBe('Usuario Prueba');
  });

  it('should logout and navigate to login', () => {
    component.salir();

    expect(authServiceStub.cerrarSesion).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('login');
  });
});

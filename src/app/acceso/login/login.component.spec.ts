import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Servicios/auth.service';
import { createAuthServiceStub, createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authStub: ReturnType<typeof createAuthServiceStub>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authStub = createAuthServiceStub();
    routerSpy = createRouterSpy();
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate fields and create the form on init', () => {
    component.ngOnInit();
    component.LoginUserForm.get('cc_usuario').markAsTouched();
    component.LoginUserForm.get('contrasena_usuario').markAsTouched();

    expect(component.ccUsuarioNoValido).toBeTruthy();
    expect(component.contrasenaUsuarioNoValido).toBeTruthy();
    expect(component.LoginUserForm.get('cc_usuario').value).toBeNull();
  });

  it('should ignore invalid login attempts', () => {
    component.ngOnInit();
    component.LoginUserForm.setValue({
      cc_usuario: '',
      contrasena_usuario: '',
    });

    component.login();

    expect(authStub.login).not.toHaveBeenCalled();
  });

  it('should login and navigate when the credentials are valid', fakeAsync(() => {
    component.ngOnInit();
    component.LoginUserForm.setValue({
      cc_usuario: '1001001',
      contrasena_usuario: 'password123',
    });
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
    spyOn(Swal, 'showLoading');
    spyOn(Swal, 'close');

    component.login();
    tick();

    expect(authStub.login).toHaveBeenCalledWith('1001001', 'password123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/lotes']);
  }));

  it('should surface authentication errors', fakeAsync(() => {
    component.ngOnInit();
    component.LoginUserForm.setValue({
      cc_usuario: '1001001',
      contrasena_usuario: 'password123',
    });
    authStub.login.and.returnValue({
      subscribe(next, error) {
        error({ error: { message: 'boom' } });
        return { unsubscribe() {} } as any;
      },
    } as any);
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
    spyOn(Swal, 'showLoading');

    component.login();
    tick();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));
});

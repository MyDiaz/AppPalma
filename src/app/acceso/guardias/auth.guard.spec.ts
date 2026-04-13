import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../Servicios/auth.service';
import { createAuthServiceStub, createRouterSpy } from 'src/testing/spec-helpers';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authStub: ReturnType<typeof createAuthServiceStub>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authStub = createAuthServiceStub();
    routerSpy = createRouterSpy();
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should be created', () => {
    const guard = TestBed.inject(AuthGuard);
    expect(guard).toBeTruthy();
  });

  it('should allow access when authenticated and redirect when not', () => {
    const guard = TestBed.inject(AuthGuard);

    authStub.estaAutenticado.and.returnValue(true);
    expect(guard.canActivate({} as any, {} as any)).toBeTruthy();
    expect(routerSpy.navigate).not.toHaveBeenCalled();

    authStub.estaAutenticado.and.returnValue(false);
    expect(guard.canActivate({} as any, {} as any)).toBeFalsy();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});

import { HttpRequest, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthInterceptor, AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  function base64Url(value: string): string {
    return btoa(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  function createToken(payload: Record<string, unknown>): string {
    return ['header', base64Url(JSON.stringify(payload)), 'signature'].join('.');
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should register a user with POST', () => {
    const usuario = { cc_usuario: '1001', nombre: 'Ana' };
    const respuesta = { message: 'ok' };

    service.registrarUsuario(usuario).subscribe((result) => {
      expect(result).toEqual(respuesta as any);
    });

    const req = httpMock.expectOne(`${environment.url}/usuarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(usuario);

    req.flush(respuesta);
  });

  it('should login, store the token and mark the session as active', () => {
    const response = {
      token: createToken({ sub: '1001', exp: 2000000000, nbf: 1000 }),
      vence: '2026-12-01',
      creacion: '2026-01-01',
    };

    service.login('1001', 'secret').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      cc_usuario: '1001',
      contrasena_usuario: 'secret',
    });

    req.flush(response);

    expect(localStorage.getItem('token')).toBe(response.token);
    expect(localStorage.getItem('expira')).toBe(response.vence);
    expect(localStorage.getItem('creacion')).toBe(response.creacion);
    expect(service.isLoggedIn.value).toBe(true);
  });

  it('should return the user id from a string sub claim', () => {
    localStorage.setItem('token', createToken({ sub: '1234567' }));

    expect(service.getIdUsuario()).toBe('1234567');
  });

  it('should return the user id from an object sub claim', () => {
    localStorage.setItem(
      'token',
      createToken({ sub: { cc_usuario: '7654321' } })
    );

    expect(service.getIdUsuario()).toBe('7654321');
  });

  it('should return null when the token or subject is missing', () => {
    expect(service.getIdUsuario()).toBeNull();

    localStorage.setItem('token', createToken({ foo: 'bar' }));

    expect(service.getIdUsuario()).toBeNull();
  });

  it('should report authenticated for a valid token window', () => {
    spyOn(Date, 'now').and.returnValue(1500000000000);
    localStorage.setItem(
      'token',
      createToken({ exp: 2000000000, nbf: 1000 })
    );

    expect(service.estaAutenticado()).toBe(true);
    expect(service.isLoggedIn.value).toBe(true);
  });

  it('should report not authenticated for an expired token', () => {
    spyOn(Date, 'now').and.returnValue(1500000000000);
    localStorage.setItem(
      'token',
      createToken({ exp: 1000, nbf: 999 })
    );

    expect(service.estaAutenticado()).toBe(false);
    expect(service.isLoggedIn.value).toBe(false);
  });

  it('should report not authenticated when the token is missing', () => {
    expect(service.estaAutenticado()).toBe(false);
    expect(service.isLoggedIn.value).toBe(false);
  });

  it('should clear the token on logout', () => {
    localStorage.setItem('token', createToken({ sub: '1001' }));

    service.cerrarSesion();

    expect(service.isLoggedIn.value).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('AuthInterceptor', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => localStorage.clear());

  it('should add the Authorization header when a token exists', () => {
    localStorage.setItem('token', 'token-value');

    const interceptor = new AuthInterceptor();
    const request = new HttpRequest('GET', '/api/test');
    const next = jasmine.createSpyObj('next', ['handle']);
    next.handle.and.returnValue(of(new HttpResponse({ status: 200 })));

    interceptor.intercept(request, next);

    expect(next.handle).toHaveBeenCalled();
    const forwardedRequest = next.handle.calls.mostRecent().args[0] as HttpRequest<
      unknown
    >;
    expect(forwardedRequest.headers.get('Authorization')).toBe(
      'Bearer token-value'
    );
  });

  it('should pass the original request when there is no token', () => {
    const interceptor = new AuthInterceptor();
    const request = new HttpRequest('GET', '/api/test');
    const next = jasmine.createSpyObj('next', ['handle']);
    next.handle.and.returnValue(of(new HttpResponse({ status: 200 })));

    interceptor.intercept(request, next);

    expect(next.handle).toHaveBeenCalledWith(request);
  });
});

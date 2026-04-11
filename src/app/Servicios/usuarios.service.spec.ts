import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(UsuariosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all users', () => {
    const usuarios = [{ cc_usuario: '1001' }];

    service.getUsuarios().subscribe((result) => {
      expect(result).toEqual(usuarios as any);
    });

    const req = httpMock.expectOne(`${environment.url}/usuarios`);
    expect(req.request.method).toBe('GET');
    req.flush(usuarios);
  });

  it('should get a user by cc_usuario', () => {
    const usuario = { cc_usuario: '1001' };

    service.getUsuario('1001').subscribe((result) => {
      expect(result).toEqual(usuario as any);
    });

    const req = httpMock.expectOne(`${environment.url}/usuarios/1001`);
    expect(req.request.method).toBe('GET');
    req.flush(usuario);
  });

  it('should update a user with PUT', () => {
    const usuario = { cc_usuario: '1001', nombre: 'Ana' };
    const respuesta = { message: 'updated' };

    service.updateUsuario('1001', usuario as any).subscribe((result) => {
      expect(result).toEqual(respuesta as any);
    });

    const req = httpMock.expectOne(`${environment.url}/usuarios/1001`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(usuario);
    req.flush(respuesta);
  });

  it('should update the authenticated profile', () => {
    const profile = { nombre: 'Ana' };
    const usuario = { cc_usuario: '1001' };

    service.updateProfile(profile as any).subscribe((result) => {
      expect(result).toEqual(usuario as any);
    });

    const req = httpMock.expectOne(`${environment.url}/self/profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(profile);
    req.flush(usuario);
  });

  it('should update the password', () => {
    const nuevaContrasena = { contrasena_actual: 'old', contrasena_nueva: 'new' };
    const respuesta = { message: 'changed' };

    service.changePassword(nuevaContrasena as any).subscribe((result) => {
      expect(result).toEqual(respuesta as any);
    });

    const req = httpMock.expectOne(`${environment.url}/self/password`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(nuevaContrasena);
    req.flush(respuesta);
  });

  it('should disable a user', () => {
    const respuesta = { message: 'disabled' };

    service.deshabilitarUsuario('1001').subscribe((result) => {
      expect(result).toEqual(respuesta as any);
    });

    const req = httpMock.expectOne(`${environment.url}/usuarios/1001`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ validado: false });
    req.flush(respuesta);
  });

  it('should enable a user', () => {
    const respuesta = { message: 'enabled' };

    service.habilitarUsuario('1001').subscribe((result) => {
      expect(result).toEqual(respuesta as any);
    });

    const req = httpMock.expectOne(`${environment.url}/usuarios/1001`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ validado: true });
    req.flush(respuesta);
  });
});

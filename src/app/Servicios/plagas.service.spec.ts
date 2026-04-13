import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PlagasService } from './plagas.service';

describe('PlagasService', () => {
  let service: PlagasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(PlagasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all plagas', () => {
    const response = [{ nombre_comun_plaga: 'Plaga 1' }];

    service.getPlagas().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/plagas`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get a plaga by name', () => {
    const response = { nombre_comun_plaga: 'Plaga 1' };

    service.getPlaga('Plaga 1').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/plaga/Plaga 1`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should create a plaga', () => {
    const payload = { nombre_comun_plaga: 'Plaga 1' };
    const response = { message: 'ok' };

    service.postPlaga(payload as any).subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/plagas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('should update a plaga', () => {
    const payload = { nombre_comun_plaga: 'Plaga 1' };
    const response = { message: 'updated' };

    service.putPlaga(payload as any, 'Plaga 1').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/plaga/Plaga 1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('should delete a plaga', () => {
    const response = { message: 'deleted' };

    service.eliminarPlaga('Plaga 1').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/plaga/Plaga 1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(response);
  });
});

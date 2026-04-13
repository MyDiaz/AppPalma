import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PrecipitacionesService } from './precipitaciones.service';

describe('PrecipitacionesService', () => {
  let service: PrecipitacionesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(PrecipitacionesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get precipitaciones', () => {
    const response = [{ fecha: '2026-01-01', valor: 10 }];

    service.getPrecipitaciones().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/precipitaciones`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});

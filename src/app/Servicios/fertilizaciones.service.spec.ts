import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { FertilizacionesService } from './fertilizaciones.service';

describe('FertilizacionesService', () => {
  let service: FertilizacionesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(FertilizacionesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get fertilizaciones', () => {
    const response = [{ id: 1 }];

    service.getFertilizaciones().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/fertilizaciones`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get one fertilizacion by id', () => {
    const response = [{ id_fertilizacion: '10' }];

    service.getFertilizacion('10').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/fertilizaciones/10`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});

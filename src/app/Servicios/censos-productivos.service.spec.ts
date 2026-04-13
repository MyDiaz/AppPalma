import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { CensosProductivosService } from './censos-productivos.service';

describe('CensosProductivosService', () => {
  let service: CensosProductivosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(CensosProductivosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all productivos', () => {
    const response = [{ id: 1 }];

    service.getCensosProductivos().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/censo-productivo`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get the minimum year', () => {
    const response = [{ min_year: 2020 }];

    service.getCensosProductivosMinYear().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/censo-productivo/min_year`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get productivos for a lote', () => {
    const response = [{ lote: 'Lote 1' }];

    service.getCensosProductivosLote('Lote 1').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/censo-productivo/Lote 1`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});

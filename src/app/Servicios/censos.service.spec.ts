import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { CensosService } from './censos.service';

describe('CensosService', () => {
  let service: CensosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(CensosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get censos', () => {
    const response = [{ id: 1 }];

    service.getCensos().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/censos`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get censo images', () => {
    const response = [{ id: 'img-1' }];

    service.getImagenesCenso('10').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/censos/imagenes/10`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});

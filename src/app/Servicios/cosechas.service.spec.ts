import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { CosechasService } from './cosechas.service';

describe('CosechasService', () => {
  let service: CosechasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(CosechasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get cosechas', () => {
    const response = [{ id: 1 }];

    service.getCosechas().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/cosechas`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get a cosecha by id', () => {
    const response = [{ id_cosecha: '10' }];

    service.getCosecha('10').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/cosecha/10`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});

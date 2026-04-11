import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { ErradicacionesService } from './erradicaciones.service';

describe('ErradicacionesService', () => {
  let service: ErradicacionesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ErradicacionesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get erradicaciones', () => {
    const response = [{ id: 1 }];

    service.getErradicaciones().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/erradicaciones`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});

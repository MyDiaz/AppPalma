import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AgroquimicosService } from './agroquimicos.service';
import { environment } from 'src/environments/environment';

describe('AgroquimicosService', () => {
  let service: AgroquimicosService;
  let httpMock: HttpTestingController;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    })
  );

  beforeEach(() => {
    service = TestBed.inject(AgroquimicosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get agroquimicos', () => {
    service.getAgroquimicos().subscribe();
    const req = httpMock.expectOne(`${environment.url}/agroquimico`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get a single agroquimico', () => {
    service.getAgroquimico('1').subscribe();
    const req = httpMock.expectOne(`${environment.url}/agroquimico/1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should get agroquimico registration records', () => {
    service.getRegistroAgroquimico().subscribe();
    const req = httpMock.expectOne(`${environment.url}/registro_tratamientos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should post agroquimico data', () => {
    service.postAgroquimico({ nombre: 'Producto' }).subscribe();
    const req = httpMock.expectOne(`${environment.url}/agroquimico`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nombre: 'Producto' });
    req.flush({ message: 'ok' });
  });

  it('should delete agroquimico data', () => {
    service.eliminarAgroquimico('1').subscribe();
    const req = httpMock.expectOne(`${environment.url}/agroquimico/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
  });

  it('should update agroquimico data', () => {
    service.actualizarAgroquimico('1', { nombre: 'Nuevo' }).subscribe();
    const req = httpMock.expectOne(`${environment.url}/agroquimico/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nombre: 'Nuevo' });
    req.flush({ message: 'ok' });
  });
});

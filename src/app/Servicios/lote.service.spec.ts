import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { LoteService } from './lote.service';

describe('LoteService', () => {
  let service: LoteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoteService],
    });

    service = TestBed.inject(LoteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all lotes', () => {
    const lotes = [{ nombre: 'Lote 1' }];

    service.getLotes().subscribe((result) => {
      expect(result).toEqual(lotes as any);
    });

    const req = httpMock.expectOne(`${environment.url}/lote`);
    expect(req.request.method).toBe('GET');
    req.flush(lotes);
  });

  it('should get one lote and return the first item in the response', () => {
    const lote = { nombre: 'Lote 1' };

    service.getLote('Lote 1').subscribe((result) => {
      expect(result).toEqual(lote as any);
    });

    const req = httpMock.expectOne(`${environment.url}/lote/Lote 1`);
    expect(req.request.method).toBe('GET');
    req.flush([lote, { nombre: 'Lote 2' }]);
  });

  it('should build an encoded map URL for a lote name', () => {
    expect(service.getLoteMapaUrl('Lote con espacios')).toBe(
      `${environment.url}/lote/mapa/Lote%20con%20espacios`
    );
  });

  it('should create a lote with POST', () => {
    const payload = { nombre: 'Lote 1' };
    const respuesta = { message: 'ok' };

    service.postLote(payload).subscribe((result) => {
      expect(result).toEqual(respuesta as any);
    });

    const req = httpMock.expectOne(`${environment.url}/lote`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(respuesta);
  });

  it('should update a lote with PUT', () => {
    const payload = { nombre: 'Lote 1' };
    const respuesta = { message: 'updated' };

    service.putLote(payload, 'Lote 1').subscribe((result) => {
      expect(result).toEqual(respuesta as any);
    });

    const req = httpMock.expectOne(`${environment.url}/lote/Lote 1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(respuesta);
  });

  it('should delete a lote with DELETE', () => {
    service.deleteLote('Lote 1').subscribe((result) => {
      expect(result).toEqual({ message: 'deleted' } as any);
    });

    const req = httpMock.expectOne(`${environment.url}/lote/Lote 1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'deleted' });
  });

  it('should get the palms for a lote', () => {
    const palmas = [{ id: 1 }];

    service.getPalmasLote('Lote 1').subscribe((result) => {
      expect(result).toEqual(palmas as any);
    });

    const req = httpMock.expectOne(`${environment.url}/movil/palmas/Lote 1`);
    expect(req.request.method).toBe('GET');
    req.flush(palmas);
  });

  it('should filter the agrochemicals by type', () => {
    expect(service.getAgroquimicos('insectisida')).toEqual([
      { nombre: 'Fipronil', tipo: 'insectisida' },
      { nombre: 'Lorsban', tipo: 'insectisida' },
      { nombre: 'Kunfu', tipo: 'insectisida' },
      { nombre: 'Brigada', tipo: 'insectisida' },
      { nombre: 'Nilo', tipo: 'insectisida' },
    ]);
  });

  it('should return the known plagas and enfermedades', () => {
    expect(service.getPlagas().length).toBeGreaterThan(0);
    expect(service.getEnfermedades().length).toBeGreaterThan(0);
  });

  it('should map diseases returned by the server', () => {
    const response = [
      { nombre_enfermedad: 'Rayo' },
      { nombre_enfermedad: 'Marchitez' },
    ];

    service.getEnfermedadesServer().subscribe((result) => {
      expect(result).toEqual([
        { nombre: 'Rayo' },
        { nombre: 'Marchitez' },
      ]);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedades`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should map disease stages returned by the server', () => {
    const response = [
      { nombre_enfermedad: 'Rayo', etapa_enfermedad: 'Inicial' },
      { nombre_enfermedad: 'Rayo', etapa_enfermedad: 'Avanzada' },
    ];

    service.getEtapasServer().subscribe((result) => {
      expect(result).toEqual([
        { nombre_enfermedad: 'Rayo', nombre_etapa: 'Inicial' },
        { nombre_enfermedad: 'Rayo', nombre_etapa: 'Avanzada' },
      ]);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedad-etapas`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { EnfermedadesService } from './enfermedades.service';

describe('EnfermedadesService', () => {
  let service: EnfermedadesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(EnfermedadesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get enfermedades', () => {
    const response = [{ nombre_enfermedad: 'Rayo' }];

    service.getEnfermedades().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedades`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get concatenated enfermedades', () => {
    const response = [{ nombre_enfermedad: 'Rayo' }];

    service.getEnfermedadesConcat().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedades_etapas_concat`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get one enfermedad', () => {
    const response = [{ nombre_enfermedad: 'Rayo' }];

    service.getEnfermedad('Rayo').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedad/Rayo`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should create an enfermedad', () => {
    const payload = { nombre_enfermedad: 'Rayo' };
    const response = { message: 'created' };

    service.postEnfermedad(payload as any).subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedades`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('should update an enfermedad', () => {
    const payload = { nombre_enfermedad: 'Rayo' };
    const response = { message: 'updated' };

    service.putEnfermedad(payload as any, 'Rayo').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedad/Rayo`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('should get enfermedades etapas', () => {
    const response = [{ nombre_enfermedad: 'Rayo', etapa_enfermedad: 'Inicial' }];

    service.getEnfermedadesEtapas().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedad-etapas`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get enfermedad etapas by id', () => {
    const response = [{ nombre_enfermedad: 'Rayo', etapa_enfermedad: 'Inicial' }];

    service.getEnfermedadEtapas('10').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedad-etapas/10`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should create enfermedad etapas', () => {
    const payload = { nombre_enfermedad: 'Rayo' };
    const response = { message: 'created' };

    service.postEnfermedadEtapas(payload as any).subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedad-etapas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('should delete an enfermedad', () => {
    const response = { message: 'deleted' };

    service.eliminarEnfermedad('Rayo').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedad/Rayo`);
    expect(req.request.method).toBe('DELETE');
    req.flush(response);
  });

  it('should update enfermedad con etapas', () => {
    const payload = { nombre_enfermedad: 'Rayo' };
    const response = { message: 'updated' };

    service.actualizarEnfermedadConEtapas('Rayo', payload as any).subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/enfermedad-etapas/Rayo`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('should get registered enfermedades', () => {
    const response = [{ id: 1 }];

    service.getEnfermedadesRegistradas().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/registro-enfermedades`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get current fitosanitario state', () => {
    const response = {
      total_palms_by_lote: [{ nombre_lote: 'Lote 1', total_palmas: 10 }],
      active_palms: [],
    };

    service.getEstadoFitosanitarioActual().subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(
      `${environment.url}/registro-enfermedades/estado-fitosanitario`
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get monthly fitosanitario report with filters', () => {
    const response = {
      total_casos_mes: 2,
      total_casos_acumulados: 3,
      incidencia_real: 20,
      incidencia_acumulada: 30,
      evolucion: {
        pendientes_por_tratar: 1,
        en_recuperacion: 1,
        pendientes_por_erradicar: 2,
        reincidencia: 0,
        de_alta: 1,
        eliminada: 1,
      },
      registros: [
        {
          id_palma: 10,
          nombre_enfermedad: 'Anillo rojo',
          id_registro_enfermedad: 1,
          etapa_enfermedad: 'Etapa 1',
          nombre_lote: 'Lote A',
          fecha_registro_enfermedad: '2026-04-20T00:00:00.000Z',
          observacion_registro_enfermedad: 'Observacion',
        },
      ],
    };

    service
      .getInformeMensualFitosanitario({
        mes: '2026-01',
        lote: 'Lote 1',
        enfermedad: 'Rayo',
      })
      .subscribe((result) => {
        expect(result).toEqual(response as any);
      });

    const req = httpMock.expectOne((request) => {
      return (
        request.url ===
          `${environment.url}/registro-enfermedades/informe-mensual` &&
        request.params.get('mes') === '2026-01' &&
        request.params.get('lote') === 'Lote 1' &&
        request.params.get('enfermedad') === 'Rayo'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should get registro enfermedad images', () => {
    const response = [{ id: 'img-1' }];

    service.getImagenesRegistroEnfermedad('10').subscribe((result) => {
      expect(result).toEqual(response as any);
    });

    const req = httpMock.expectOne(`${environment.url}/registro-enfermedades/imagenes/10`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});

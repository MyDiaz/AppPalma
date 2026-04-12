import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createActivatedRouteMock, createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { PerfilLoteComponent } from './perfil-lote.component';

describe('PerfilLoteComponent', () => {
  let component: PerfilLoteComponent;
  let fixture: ComponentFixture<PerfilLoteComponent>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    loteServiceSpy = jasmine.createSpyObj('LoteService', [
      'getLote',
      'getLoteMapaUrl',
      'deleteLote',
    ]);
    loteServiceSpy.getLote.and.returnValue(of({ nombre_lote: 'Lote 1', mapa: 'mapa' }));
    loteServiceSpy.getLoteMapaUrl.and.returnValue('http://example.com/mapa');
    loteServiceSpy.deleteLote.and.returnValue(of({ message: 'ok' }));
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      declarations: [PerfilLoteComponent],
      providers: [
        { provide: ActivatedRoute, useValue: createActivatedRouteMock({ params: { id: 'Lote 1' } }) },
        { provide: LoteService, useValue: loteServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilLoteComponent);
    component = fixture.componentInstance;
  });

  it('should create and load lote data', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(loteServiceSpy.getLote).toHaveBeenCalledWith('Lote 1');
    expect(component.kmlUrl).toBe('http://example.com/mapa');
  });

  it('should navigate to registros and edit lote', () => {
    component.nombre_lote = 'Lote 1';

    component.verRegistros('historico');
    component.verLoteEditar('Lote 1');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['historico'], {
      queryParams: { lote: 'Lote 1' },
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/editar-lote', 'Lote 1']);
  });

  it('should identify empty strings', () => {
    expect(component.isStringEmpty('')).toBe(true);
    expect(component.isStringEmpty('   ')).toBe(true);
    expect(component.isStringEmpty('Lote')).toBe(false);
  });

  it('should delete the lote after confirmation', fakeAsync(() => {
    component.nombre_lote = 'Lote 1';
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.eliminarLote();
    tick();
    tick();

    expect(loteServiceSpy.deleteLote).toHaveBeenCalledWith('Lote 1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/lotes']);
  }));

  it('should return early when there is no map and surface load errors', () => {
    component.lote = { mapa: '' };
    component.initMap();

    expect(component.map).toBeUndefined();

    loteServiceSpy.getLote.and.returnValue(
      throwError({ status: 0, error: { message: 'boom' } })
    );
    component = TestBed.createComponent(PerfilLoteComponent).componentInstance;
    component.ngOnInit();

    expect(component.bandera_error).toBeTruthy();
    expect(component.mensaje_error).toBe('Servicio no disponible');
  });

  it('should report non-network load errors and cancel deletes', fakeAsync(() => {
    loteServiceSpy.getLote.and.returnValue(
      throwError({ status: 500, error: { message: 'boom-detail' } })
    );
    component = TestBed.createComponent(PerfilLoteComponent).componentInstance;
    component.ngOnInit();

    expect(component.bandera_error).toBeTruthy();
    expect(component.mensaje_error).toBe('boom-detail');

    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: false } as any)
    );
    component.nombre_lote = 'Lote 1';
    component.eliminarLote();
    tick();

    expect(loteServiceSpy.deleteLote).not.toHaveBeenCalled();
  }));
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { FormularioLoteComponent } from './formulario-lote.component';

describe('FormularioLoteComponent', () => {
  let component: FormularioLoteComponent;
  let fixture: ComponentFixture<FormularioLoteComponent>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLote', 'postLote', 'putLote']);
    loteServiceSpy.getLote.and.returnValue(
      of({
        nombre_lote: 'Lote 1',
        año_siembra: 2020,
        hectareas: 10,
        numero_palmas: 100,
        material_siembra: 'material',
        mapa: 'mapa',
      } as any)
    );
    loteServiceSpy.postLote.and.returnValue(of({ message: 'ok' }));
    loteServiceSpy.putLote.and.returnValue(of({ message: 'ok' }));
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FormularioLoteComponent],
      providers: [
        { provide: LoteService, useValue: loteServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioLoteComponent);
    component = fixture.componentInstance;
  });

  it('should create a new lot form with defaults', () => {
    component.id_lote = undefined as any;
    component.crearFormulario();

    expect(component.NuevoLoteForm.get('año_siembra').value).toBe(new Date().getFullYear().toString());
    expect(component.NuevoLoteForm.get('mapa').value).toBeNull();
  });

  it('should load a lot and create the edit form on init', () => {
    component.id_lote = '1';
    component.ngOnInit();

    expect(loteServiceSpy.getLote).toHaveBeenCalledWith('1');
    expect(component.NuevoLoteForm.get('nombre_lote').value).toBe('Lote 1');
  });

  it('should build the encoded request payload', () => {
    component.id_lote = undefined as any;
    component.crearFormulario();
    component.NuevoLoteForm.setValue({
      nombre_lote: 'Lote 1',
      año_siembra: '2020',
      hectareas: '10',
      numero_palmas: '100',
      material_siembra: 'Material A',
      mapa: null,
    });

    const request = component.construirRequest();

    expect(request.nombre_lote).toBe('Lote%201');
    expect(request.material_siembra).toBe('Material%20A');
  });

  it('should set the selected file in the form', () => {
    component.id_lote = undefined as any;
    component.crearFormulario();
    const file = new File(['map'], 'mapa.txt', { type: 'text/plain' });

    component.handleFileInput({ target: { files: [file] } });

    expect(component.archivoMapa).toBe(file);
    expect(component.NuevoLoteForm.get('mapa').value).toBe(file);
  });

  it('should expose validation getters and handle empty file input', () => {
    component.id_lote = undefined as any;
    component.crearFormulario();
    component.NuevoLoteForm.get('nombre_lote').markAsTouched();
    component.NuevoLoteForm.get('nombre_lote').setErrors({ required: true });
    component.NuevoLoteForm.get('año_siembra').markAsTouched();
    component.NuevoLoteForm.get('año_siembra').setErrors({ required: true });
    component.NuevoLoteForm.get('hectareas').markAsTouched();
    component.NuevoLoteForm.get('hectareas').setErrors({ required: true });
    component.NuevoLoteForm.get('numero_palmas').markAsTouched();
    component.NuevoLoteForm.get('numero_palmas').setErrors({ required: true });
    component.NuevoLoteForm.get('material_siembra').markAsTouched();
    component.NuevoLoteForm.get('material_siembra').setErrors({ required: true });

    expect(component.nombreLoteNoValido).toBe(true);
    expect(component.AnoSiembraNoValido).toBe(true);
    expect(component.HectareasNoValido).toBe(true);
    expect(component.NumeroPalmasNoValido).toBe(true);
    expect(component.MaterialSiembraNoValido).toBe(true);

    component.handleFileInput({ target: { files: [] } });

    expect(component.archivoMapa).toBeNull();
    expect(component.NuevoLoteForm.get('mapa').value).toBeUndefined();
  });

  it('should save a new lot when confirmed', fakeAsync(() => {
    component.id_lote = undefined as any;
    component.crearFormulario();
    component.NuevoLoteForm.setValue({
      nombre_lote: 'Lote 1',
      año_siembra: '2020',
      hectareas: '10',
      numero_palmas: '100',
      material_siembra: 'Material A',
      mapa: null,
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.confirmarYGuardarLote(component.construirRequest());
    tick();
    tick();

    expect(loteServiceSpy.postLote).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('lotes');
  }));

  it('should update an existing lot when confirmed', fakeAsync(() => {
    component.id_lote = '1';
    component.lote_req.nombre_lote = 'Lote 1';
    component.crearFormulario();
    component.NuevoLoteForm.setValue({
      nombre_lote: 'Lote 1',
      año_siembra: '2020',
      hectareas: '10',
      numero_palmas: '100',
      material_siembra: 'Material A',
      mapa: null,
    });
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.confirmarYGuardarLote(component.construirRequest());
    tick();
    tick();

    expect(loteServiceSpy.putLote).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('lote/Lote%201');
  }));

  it('should surface backend errors for create and update', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    loteServiceSpy.postLote.and.returnValue(
      throwError({ error: { message: 'boom' } })
    );

    component.id_lote = undefined as any;
    component.crearFormulario();
    component.NuevoLoteForm.setValue({
      nombre_lote: 'Lote 1',
      año_siembra: '2020',
      hectareas: '10',
      numero_palmas: '100',
      material_siembra: 'Material A',
      mapa: null,
    });

    component.confirmarYGuardarLote(component.construirRequest());
    tick();
    tick();

    expect(loteServiceSpy.postLote).toHaveBeenCalled();
  }));

  it('should navigate back to the appropriate route', () => {
    component.id_lote = '1';
    component.regresar();
    component.id_lote = undefined as any;
    component.regresar();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('lote/1');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('lotes');
  });

  it('should call the file reader branch and handle cancel flow', () => {
    component.id_lote = undefined as any;
    component.crearFormulario();
    const leerSpy = spyOn(component as any, 'leerArchivoMapa');
    const confirmarSpy = spyOn(component as any, 'confirmarYGuardarLote');
    const file = new File(['map'], 'mapa.txt', { type: 'text/plain' });
    component.archivoMapa = file;

    component.onSubmit();

    expect(leerSpy).toHaveBeenCalled();
    expect(confirmarSpy).not.toHaveBeenCalled();

    leerSpy.calls.reset();
    confirmarSpy.calls.reset();
    component.archivoMapa = null;
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: false } as any)
    );

    component.onSubmit();

    expect(confirmarSpy).toHaveBeenCalled();
  });
});

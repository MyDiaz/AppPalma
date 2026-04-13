import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import { CensosService } from 'src/app/Servicios/censos.service';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ModalComponent>>;
  let censosServiceSpy: any;
  let enfermedadesServiceSpy: any;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    censosServiceSpy = {
      getImagenesCenso: jasmine.createSpy('getImagenesCenso').and.returnValue(of([])),
    };
    enfermedadesServiceSpy = {
      getImagenesRegistroEnfermedad: jasmine.createSpy('getImagenesRegistroEnfermedad').and.returnValue(of([])),
    };
    await TestBed.configureTestingModule({
      declarations: [ModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { rowData: {} } },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: EnfermedadesService, useValue: enfermedadesServiceSpy },
        { provide: CensosService, useValue: censosServiceSpy },
        {
          provide: DomSanitizer,
          useValue: { bypassSecurityTrustUrl: (value: string) => value },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load censo images, load enfermedad images and close the dialog', () => {
    (component as any).data = {
      rowData: {
        id_censo: 1,
        observacion_censo: 'OBS',
        id_registro_enfermedad: 2,
        observacion_registro_enfermedad: 'OBS 2',
      },
    };
    censosServiceSpy.getImagenesCenso.and.returnValue(
      of([{ imagen: { data: [1, 2, 3] } }])
    );
    enfermedadesServiceSpy.getImagenesRegistroEnfermedad.and.returnValue(
      of([{ imagen: { data: [4, 5, 6] } }])
    );

    component.ngOnInit();
    component.close();

    expect(censosServiceSpy.getImagenesCenso).toHaveBeenCalledWith(1);
    expect(enfermedadesServiceSpy.getImagenesRegistroEnfermedad).toHaveBeenCalledWith(2);
    expect(component.loading).toBeFalsy();
    expect(component.imageUrls.length).toBe(2);
    expect(dialogRefSpy.close).toHaveBeenCalled();
    expect(component.sanitizeUrl('url')).toBe('url');
  });

  it('should keep the modal idle when there is no row data to load', () => {
    (component as any).data = {
      rowData: {},
    };

    component.ngOnInit();

    expect(censosServiceSpy.getImagenesCenso).not.toHaveBeenCalled();
    expect(enfermedadesServiceSpy.getImagenesRegistroEnfermedad).not.toHaveBeenCalled();
    expect(component.loading).toBe(true);
  });
});

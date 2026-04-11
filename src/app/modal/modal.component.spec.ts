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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { rowData: {} } },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
        {
          provide: EnfermedadesService,
          useValue: { getImagenesRegistroEnfermedad: () => of([]) },
        },
        {
          provide: CensosService,
          useValue: { getImagenesCenso: () => of([]) },
        },
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
});

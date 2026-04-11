import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from 'src/app/Servicios/auth.service';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';
import {
  createAuthServiceStub,
  createNgbModalSpy,
  createRouterSpy,
} from 'src/testing/spec-helpers';
import { UsuariosComponent } from './usuarios.component';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [UsuariosComponent],
      providers: [
        { provide: AuthService, useValue: createAuthServiceStub() },
        { provide: Router, useValue: createRouterSpy() },
        {
          provide: UsuariosService,
          useValue: {
            getUsuario: () =>
              of({
                nombre_usuario: 'Usuario Prueba',
                telefono: '3000000000',
                correo: 'test@example.com',
              }),
            updateProfile: () => of({}),
            changePassword: () => of({ message: 'ok' }),
          },
        },
        { provide: NgbModal, useValue: createNgbModalSpy() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

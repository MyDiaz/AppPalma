import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from 'src/app/Servicios/auth.service';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';
import {
  createActivatedRouteMock,
  createAuthServiceStub,
  createRouterSpy,
} from 'src/testing/spec-helpers';
import { RegistroComponent } from './registro.component';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegistroComponent],
      providers: [
        { provide: AuthService, useValue: createAuthServiceStub() },
        { provide: Router, useValue: createRouterSpy() },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
        {
          provide: UsuariosService,
          useValue: {
            getUsuario: () => of({}),
            updateUsuario: () => of({ message: 'ok' }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

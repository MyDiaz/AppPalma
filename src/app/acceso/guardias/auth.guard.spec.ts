import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../Servicios/auth.service';
import { createAuthServiceStub, createRouterSpy } from 'src/testing/spec-helpers';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: createAuthServiceStub() },
        { provide: Router, useValue: createRouterSpy() },
      ],
    });
  });

  it('should be created', () => {
    const guard = TestBed.inject(AuthGuard);
    expect(guard).toBeTruthy();
  });
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './Servicios/auth.service';
import { createAuthServiceStub } from 'src/testing/spec-helpers';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let authServiceStub: ReturnType<typeof createAuthServiceStub>;

  beforeEach(async () => {
    authServiceStub = createAuthServiceStub();
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: AuthService, useValue: authServiceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the expected title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('AppPalma');
  });

  it('should mirror auth state changes', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.ngOnInit();
    expect(app.estaAutenticado).toBeFalsy();

    authServiceStub.isLoggedIn.next(true);

    expect(app.estaAutenticado).toBeTruthy();
  });
});

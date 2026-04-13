import { HttpHandler } from '@angular/common/http';
import { convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

export function createActivatedRouteMock(options?: {
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
}) {
  const params = convertToParamMap(options?.params ?? {});
  const queryParams = convertToParamMap(options?.queryParams ?? {});

  return {
    snapshot: {
      paramMap: params,
      queryParamMap: queryParams,
    },
    paramMap: of(params),
    queryParamMap: of(queryParams),
  };
}

export function createRouterSpy() {
  return jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
}

export function createMatDialogSpy() {
  return jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
}

export function createNgbModalSpy() {
  const modalSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
  modalSpy.open.and.returnValue({ result: Promise.resolve(true) });
  return modalSpy;
}

export function createAuthServiceStub(overrides: Record<string, unknown> = {}) {
  return {
    isLoggedIn: new BehaviorSubject<boolean>(false),
    estaAutenticado: jasmine.createSpy('estaAutenticado').and.returnValue(true),
    getIdUsuario: jasmine.createSpy('getIdUsuario').and.returnValue('1234567'),
    login: jasmine.createSpy('login').and.returnValue(of({})),
    registrarUsuario: jasmine.createSpy('registrarUsuario').and.returnValue(
      of({ message: 'ok' })
    ),
    ...overrides,
  };
}

export function createHttpHandlerStub(): Partial<HttpHandler> {
  return {
    handle: jasmine.createSpy('handle'),
  };
}

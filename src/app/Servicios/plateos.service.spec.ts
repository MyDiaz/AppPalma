import { HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PlateosService } from './plateos.service';
import { createHttpHandlerStub } from 'src/testing/spec-helpers';

describe('PlateosService', () => {
  let service: PlateosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HttpHandler, useValue: createHttpHandlerStub() }],
    });
    service = TestBed.inject(PlateosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

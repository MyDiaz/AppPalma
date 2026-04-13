import { HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ViajesService } from './viajes.service';
import { createHttpHandlerStub } from 'src/testing/spec-helpers';

describe('ViajesService', () => {
  let service: ViajesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HttpHandler, useValue: createHttpHandlerStub() }],
    });
    service = TestBed.inject(ViajesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

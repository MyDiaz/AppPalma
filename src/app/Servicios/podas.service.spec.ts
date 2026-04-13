import { HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PodasService } from './podas.service';
import { createHttpHandlerStub } from 'src/testing/spec-helpers';

describe('PodasService', () => {
  let service: PodasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HttpHandler, useValue: createHttpHandlerStub() }],
    });
    service = TestBed.inject(PodasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

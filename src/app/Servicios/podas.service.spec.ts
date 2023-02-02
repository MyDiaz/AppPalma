import { TestBed } from '@angular/core/testing';

import { PodasService } from './podas.service';

describe('PodasService', () => {
  let service: PodasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PodasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

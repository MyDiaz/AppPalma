import { TestBed } from '@angular/core/testing';

import { AgroquimicosService } from './agroquimicos.service';

describe('AgroquimicosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AgroquimicosService = TestBed.get(AgroquimicosService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { PlateosService } from './plateos.service';

describe('PlateosService', () => {
  let service: PlateosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlateosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AgroquimicosService } from './agroquimicos.service';

describe('AgroquimicosService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    })
  );

  it('should be created', () => {
    const service = TestBed.inject(AgroquimicosService);
    expect(service).toBeTruthy();
  });
});

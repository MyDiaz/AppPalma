import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CensoProductivoComponent } from './censo-productivo.component';

describe('CensoProductivoComponent', () => {
  let component: CensoProductivoComponent;
  let fixture: ComponentFixture<CensoProductivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CensoProductivoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensoProductivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

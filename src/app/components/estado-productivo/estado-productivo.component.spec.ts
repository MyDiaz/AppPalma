import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoProductivoComponent } from './estado-productivo.component';

describe('EstadoProductivoComponent', () => {
  let component: EstadoProductivoComponent;
  let fixture: ComponentFixture<EstadoProductivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstadoProductivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoProductivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

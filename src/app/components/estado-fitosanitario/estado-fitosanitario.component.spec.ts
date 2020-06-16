import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoFitosanitarioComponent } from './estado-fitosanitario.component';

describe('EstadoFitosanitarioComponent', () => {
  let component: EstadoFitosanitarioComponent;
  let fixture: ComponentFixture<EstadoFitosanitarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstadoFitosanitarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoFitosanitarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

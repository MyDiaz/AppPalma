import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { PrecipitacionesService } from 'src/app/Servicios/precipitaciones.service';
import { PrecipitacionComponent } from './precipitacion.component';

describe('PrecipitacionComponent', () => {
  let component: PrecipitacionComponent;
  let fixture: ComponentFixture<PrecipitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PrecipitacionComponent],
      providers: [
        {
          provide: PrecipitacionesService,
          useValue: { getPrecipitaciones: () => of([]) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecipitacionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ErradicacionesService } from 'src/app/Servicios/erradicaciones.service';
import { LoteService } from 'src/app/Servicios/lote.service';
import { ErradicacionesComponent } from './erradicaciones.component';

describe('ErradicacionesComponent', () => {
  let component: ErradicacionesComponent;
  let fixture: ComponentFixture<ErradicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ErradicacionesComponent],
      providers: [
        DatePipe,
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
        {
          provide: ErradicacionesService,
          useValue: { getErradicaciones: () => of([]) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ErradicacionesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

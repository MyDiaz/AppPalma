import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { PlateosService } from 'src/app/Servicios/plateos.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { PlateosComponent } from './plateos.component';

describe('PlateosComponent', () => {
  let component: PlateosComponent;
  let fixture: ComponentFixture<PlateosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PlateosComponent],
      providers: [
        {
          provide: PlateosService,
          useValue: {
            getPlateos: () => of([]),
            getPlateo: () => of([]),
          },
        },
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

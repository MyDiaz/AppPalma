import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { PodasService } from 'src/app/Servicios/podas.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { PodasComponent } from './podas.component';

describe('PodasComponent', () => {
  let component: PodasComponent;
  let fixture: ComponentFixture<PodasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PodasComponent],
      providers: [
        {
          provide: PodasService,
          useValue: {
            getPodas: () => of([]),
            getPoda: () => of([]),
          },
        },
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PodasComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

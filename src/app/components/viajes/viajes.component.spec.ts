import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { ViajesService } from 'src/app/Servicios/viajes.service';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { ViajesComponent } from './viajes.component';

describe('ViajesComponent', () => {
  let component: ViajesComponent;
  let fixture: ComponentFixture<ViajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ViajesComponent],
      providers: [
        { provide: ViajesService, useValue: { getViajes: () => of([]) } },
        { provide: LoteService, useValue: { getLotes: () => of([]) } },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViajesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

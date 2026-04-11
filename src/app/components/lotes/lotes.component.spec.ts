import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoteService } from 'src/app/Servicios/lote.service';
import { createRouterSpy } from 'src/testing/spec-helpers';
import { LotesComponent } from './lotes.component';

describe('LotesComponent', () => {
  let component: LotesComponent;
  let fixture: ComponentFixture<LotesComponent>;
  let loteServiceSpy: jasmine.SpyObj<LoteService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    loteServiceSpy = jasmine.createSpyObj('LoteService', ['getLotes']);
    loteServiceSpy.getLotes.and.returnValue(
      of([
        { nombre_lote: 'Lote 1', numero_palmas: 10 } as any,
        { nombre_lote: 'Lote 2', numero_palmas: 15 } as any,
      ])
    );
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      declarations: [LotesComponent],
      providers: [
        { provide: LoteService, useValue: loteServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LotesComponent);
    component = fixture.componentInstance;
  });

  it('should create and load totals', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(component.totalLotes).toBe(2);
    expect(component.totalPalmas).toBe(25);
  });

  it('should navigate to the lote and create new lotes', () => {
    component.verLote('Lote 1');
    component.agregarNuevoLote();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/lote', 'Lote 1']);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/nuevo-lote']);
  });
});

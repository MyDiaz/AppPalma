import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PlagasService } from 'src/app/Servicios/plagas.service';
import { createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { ListadoPlagasComponent } from './listado-plagas.component';

describe('ListadoPlagasComponent', () => {
  let component: ListadoPlagasComponent;
  let fixture: ComponentFixture<ListadoPlagasComponent>;
  let plagasServiceSpy: jasmine.SpyObj<PlagasService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    plagasServiceSpy = jasmine.createSpyObj('PlagasService', [
      'getPlagas',
      'eliminarPlaga',
    ]);
    plagasServiceSpy.getPlagas.and.returnValue(
      of([{ nombre_comun_plaga: 'Plaga 1', nombre_etapa_plaga: 'Etapa' }])
    );
    plagasServiceSpy.eliminarPlaga.and.returnValue(of({ message: 'ok' }));
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ListadoPlagasComponent],
      providers: [
        { provide: PlagasService, useValue: plagasServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoPlagasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load plagas', () => {
    expect(component).toBeTruthy();
    expect(component.hayPlagas).toBe(true);
  });

  it('should validate and navigate to edit page', () => {
    component.NombrePlagaForm = new FormControl({
      nombre_comun_plaga: 'Plaga 1',
    }) as any;

    expect(component.esValido()).toBe(true);
    component.editarPlaga();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['nueva-plaga', 'Plaga 1']);
  });

  it('should delete the selected plaga after confirmation', fakeAsync(() => {
    component.NombrePlagaForm = new FormControl({
      nombre_comun_plaga: 'Plaga 1',
    }) as any;
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.eliminarPlaga();
    tick();
    tick();

    expect(plagasServiceSpy.eliminarPlaga).toHaveBeenCalledWith('Plaga 1');
    expect(plagasServiceSpy.getPlagas).toHaveBeenCalledTimes(2);
  }));
});

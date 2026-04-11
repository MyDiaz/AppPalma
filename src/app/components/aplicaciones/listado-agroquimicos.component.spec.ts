import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AgroquimicosService } from 'src/app/Servicios/agroquimicos.service';
import { createRouterSpy } from 'src/testing/spec-helpers';
import Swal from 'sweetalert2';
import { ListadoAgroquimicosComponent } from './listado-agroquimicos.component';

describe('ListadoAgroquimicosComponent', () => {
  let component: ListadoAgroquimicosComponent;
  let fixture: ComponentFixture<ListadoAgroquimicosComponent>;
  let agroquimicosServiceSpy: jasmine.SpyObj<AgroquimicosService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    agroquimicosServiceSpy = jasmine.createSpyObj('AgroquimicosService', [
      'getAgroquimicos',
      'eliminarAgroquimico',
    ]);
    agroquimicosServiceSpy.getAgroquimicos.and.returnValue(
      of([{ tipo_producto_agroquimico: 'Fungicida', id_producto_agroquimico: '1' }])
    );
    agroquimicosServiceSpy.eliminarAgroquimico.and.returnValue(
      of({ message: 'ok' })
    );
    routerSpy = createRouterSpy();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ListadoAgroquimicosComponent],
      providers: [
        { provide: AgroquimicosService, useValue: agroquimicosServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoAgroquimicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load agroquimicos', () => {
    expect(component).toBeTruthy();
    expect(component.hayProducto).toBe(true);
  });

  it('should validate and navigate to edit page', () => {
    component.NombreAgroquimicoForm = new FormControl({
      id_producto_agroquimico: '1',
    }) as any;

    expect(component.esValido()).toBe(true);
    component.editarAgroquimico();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['nuevo-agroquimico', '1']);
  });

  it('should delete the selected agroquimico after confirmation', fakeAsync(() => {
    component.NombreAgroquimicoForm = new FormControl({
      id_producto_agroquimico: '1',
      nombre_comun_plaga: 'Plaga 1',
    }) as any;
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    component.eliminarAgroquimico();
    tick();
    tick();

    expect(agroquimicosServiceSpy.eliminarAgroquimico).toHaveBeenCalledWith('1');
    expect(agroquimicosServiceSpy.getAgroquimicos).toHaveBeenCalledTimes(2);
  }));
});

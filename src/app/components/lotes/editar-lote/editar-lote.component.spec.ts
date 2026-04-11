import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { createActivatedRouteMock } from 'src/testing/spec-helpers';
import { EditarLoteComponent } from './editar-lote.component';

describe('EditarLoteComponent', () => {
  let component: EditarLoteComponent;
  let fixture: ComponentFixture<EditarLoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarLoteComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteMock({ params: { id: 'Lote 1' } }),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarLoteComponent);
    component = fixture.componentInstance;
  });

  it('should create and read the lote id from the route', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(component.nombre_lote).toBe('Lote 1');
  });
});

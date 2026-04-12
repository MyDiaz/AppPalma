import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevaEnfermedadComponent } from './nueva-enfermedad.component';

describe('NuevaEnfermedadComponent', () => {
  let component: NuevaEnfermedadComponent;
  let fixture: ComponentFixture<NuevaEnfermedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NuevaEnfermedadComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaEnfermedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

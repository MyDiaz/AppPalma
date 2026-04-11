import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroPlagasComponent } from './registro-plagas.component';

describe('RegistroPlagasComponent', () => {
  let component: RegistroPlagasComponent;
  let fixture: ComponentFixture<RegistroPlagasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroPlagasComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroPlagasComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevoLoteComponent } from './nuevo-lote.component';

describe('NuevoLoteComponent', () => {
  let component: NuevoLoteComponent;
  let fixture: ComponentFixture<NuevoLoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NuevoLoteComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoLoteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoPlagasComponent } from './historico-plagas.component';

describe('HistoricoPlagasComponent', () => {
  let component: HistoricoPlagasComponent;
  let fixture: ComponentFixture<HistoricoPlagasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoricoPlagasComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoPlagasComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

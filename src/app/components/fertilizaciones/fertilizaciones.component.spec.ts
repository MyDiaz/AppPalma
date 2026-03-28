import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FertilizacionesComponent } from "./fertilizaciones.component";

describe("FertilizacionesComponent", () => {
  let component: FertilizacionesComponent;
  let fixture: ComponentFixture<FertilizacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FertilizacionesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FertilizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

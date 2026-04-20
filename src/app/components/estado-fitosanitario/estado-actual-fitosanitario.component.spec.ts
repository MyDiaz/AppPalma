import { FormsModule } from "@angular/forms";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { EstadoActualFitosanitarioComponent } from "./estado-actual-fitosanitario.component";

describe("EstadoActualFitosanitarioComponent", () => {
  let component: EstadoActualFitosanitarioComponent;
  let fixture: ComponentFixture<EstadoActualFitosanitarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EstadoActualFitosanitarioComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoActualFitosanitarioComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should emit the selected lote", () => {
    const emitted: string[] = [];
    component.loteSeleccionadoChange.subscribe((value) => emitted.push(value));

    component.onLoteChange("Lote 1");
    component.onLoteChange("");

    expect(emitted).toEqual(["Lote 1", "Todos"]);
  });

  it("should format labels and values correctly", () => {
    component.loteSeleccionado = "Lote 1";
    expect(
      component.getCardTooltip({
        label: "Palmas sanas",
        value: 10,
        description: "fallback",
      })
    ).toContain("en Lote 1");

    expect(component.formatFechaRegistro("2026-01-15T00:00:00Z")).toContain(
      "2026"
    );
    expect(component.formatFechaRegistro("invalid")).toBe("invalid");
    expect(component.formatFechaRegistro("")).toBe("-");
    expect(component.formatEstadoActivo("en_tratamiento")).toBe("En tratamiento");
  });
});

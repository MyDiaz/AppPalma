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

  it("should derive summary cards from totalPalmas and activePalms", () => {
    component.totalPalmas = 10;
    component.activePalms = [
      {
        nombre_lote: "Lote 1",
        id_palma: 1,
        nombre_enfermedad: "Rayo",
        etapa_enfermedad: "Inicial",
        fecha: "2026-01-01",
        estado: "en_tratamiento",
      },
      {
        nombre_lote: "Lote 1",
        id_palma: 2,
        nombre_enfermedad: "Rayo",
        etapa_enfermedad: "Intermedia",
        fecha: "2026-01-02",
        estado: "pendiente_por_tratar",
      },
      {
        nombre_lote: "Lote 1",
        id_palma: 3,
        nombre_enfermedad: "PC",
        etapa_enfermedad: "Avanzada",
        fecha: "2026-01-03",
        estado: "pendiente_por_erradicar",
      },
    ];

    expect(component.cards).toEqual([
      jasmine.objectContaining({ label: "Total de palmas", value: 10 }),
      jasmine.objectContaining({ label: "Palmas sanas", value: 7 }),
      jasmine.objectContaining({ label: "Palmas en tratamiento", value: 1 }),
      jasmine.objectContaining({ label: "Palmas pendientes por tratar", value: 1 }),
      jasmine.objectContaining({ label: "Palmas pendientes por erradicar", value: 1 }),
    ]);
  });
});

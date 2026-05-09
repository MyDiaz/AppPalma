import {
  buildCurrentStateCards,
  buildMonthlyCards,
  buildMonthlyChartSeries,
  extractMonthlyRecords,
  formatEstadoActivo,
  formatFechaRegistro,
  mapMonthlyIncidences,
} from "./estado-fitosanitario.helpers";

describe("estado-fitosanitario helpers", () => {
  it("should build current state cards from active palms", () => {
    const cards = buildCurrentStateCards(
      [
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
      ],
      10
    );

    expect(cards).toEqual([
      jasmine.objectContaining({ label: "Total de palmas", value: 10 }),
      jasmine.objectContaining({ label: "Palmas sanas", value: 8 }),
      jasmine.objectContaining({ label: "Palmas en tratamiento", value: 1 }),
      jasmine.objectContaining({ label: "Palmas pendientes por tratar", value: 1 }),
      jasmine.objectContaining({ label: "Palmas pendientes por erradicar", value: 0 }),
    ]);
  });

  it("should build monthly cards, incidences and chart series", () => {
    const resumen = {
      total_casos_mes: 2,
      total_casos_acumulados: 5,
      incidencia_real: 12.345,
      incidencia_acumulada: 20,
      evolucion: {
        pendientes_por_tratar: 1,
        en_recuperacion: 2,
        pendientes_por_erradicar: 3,
        reincidencia: 4,
        de_alta: 5,
        eliminada: 6,
      },
      registros: [
        {
          id_palma: 1,
          nombre_lote: "Lote 1",
          nombre_enfermedad: "Rayo",
          etapa_enfermedad: "Inicial",
          estado: "en_tratamiento",
          fecha_registro_enfermedad: "2026-01-01",
        },
        {
          id_palma: 2,
          nombre_lote: "Lote 1",
          nombre_enfermedad: "Rayo",
          etapa_enfermedad: "Avanzada",
          estado: "pendiente_por_tratar",
          fecha_registro_enfermedad: "2026-01-02",
        },
      ],
    };

    const cards = buildMonthlyCards(resumen);
    const records = extractMonthlyRecords(resumen);
    const incidences = mapMonthlyIncidences(records);
    const chart = buildMonthlyChartSeries(records, "Rayo");

    expect(cards.mainCards).toEqual([
      jasmine.objectContaining({ label: "Total casos mes", value: 2 }),
      jasmine.objectContaining({ label: "Total casos acumulados", value: 5 }),
      jasmine.objectContaining({ label: "% incidencia real", value: "12.35%" }),
      jasmine.objectContaining({ label: "% incidencia acumulada", value: "20.00%" }),
    ]);
    expect(cards.evolutionCards.length).toBe(6);
    expect(incidences[0]).toEqual(
      jasmine.objectContaining({ id_palma: "1", nombre_enfermedad: "Rayo" })
    );
    expect(chart).toEqual({ labels: ["Inicial", "Avanzada"], data: [1, 1] });
  });

  it("should format dates and active state labels", () => {
    expect(formatFechaRegistro("")).toBe("-");
    expect(formatFechaRegistro("invalid")).toBe("invalid");
    expect(formatEstadoActivo("pendiente_por_erradicar")).toBe(
      "Pendiente por erradicar"
    );
  });
});

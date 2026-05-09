import {
  ActivePalmRow,
  IncidenciaMensualRow,
  MonthlyFitosanitarioRegistro,
  MonthlyFitosanitarioSummaryResponse,
  ResumenCard,
} from "./estado-fitosanitario.types";

export interface MonthlyCards {
  mainCards: ResumenCard[];
  evolutionCards: ResumenCard[];
}

export interface ChartSeries {
  labels: string[];
  data: number[];
}

export function buildCurrentStateCards(
  activePalms: ActivePalmRow[],
  totalPalmas: number
): ResumenCard[] {
  const safeActivePalms = Array.isArray(activePalms) ? activePalms : [];
  const safeTotalPalmas = Number(totalPalmas || 0);
  const pendientesPorErradicar = safeActivePalms.filter(
    (item) => item.estado === "pendiente_por_erradicar"
  ).length;
  const enTratamiento = safeActivePalms.filter(
    (item) => item.estado === "en_tratamiento"
  ).length;
  const pendientesPorTratar = safeActivePalms.filter(
    (item) => item.estado === "pendiente_por_tratar"
  ).length;
  const palmasEnfermas =
    enTratamiento + pendientesPorTratar + pendientesPorErradicar;
  const palmasSanas = Math.max(safeTotalPalmas - palmasEnfermas, 0);

  return [
    {
      label: "Total de palmas",
      value: safeTotalPalmas,
      description: "Cantidad total de palmas sembradas en el lote seleccionado.",
    },
    {
      label: "Palmas sanas",
      value: palmasSanas,
      description: "Palmas sin estado activo reportado en el lote seleccionado.",
    },
    {
      label: "Palmas en tratamiento",
      value: enTratamiento,
      description: "Palmas con tratamiento activo y que aun no han recibido alta.",
    },
    {
      label: "Palmas pendientes por tratar",
      value: pendientesPorTratar,
      description: "Palmas enfermas que requieren tratamiento pero aun no lo han iniciado.",
    },
    {
      label: "Palmas pendientes por erradicar",
      value: pendientesPorErradicar,
      description: "Palmas enfermas que deben retirarse porque la enfermedad no tiene cura.",
    },
  ];
}

export function buildMonthlyCards(
  resumen: MonthlyFitosanitarioSummaryResponse
): MonthlyCards {
  const evolucion = resumen?.evolucion || {
    pendientes_por_tratar: 0,
    en_recuperacion: 0,
    pendientes_por_erradicar: 0,
    reincidencia: 0,
    de_alta: 0,
    eliminada: 0,
  };

  return {
    mainCards: [
      {
        label: "Total casos mes",
        value: Number(resumen?.total_casos_mes ?? 0),
        description:
          "Cantidad de registros de enfermedad creados dentro del mes seleccionado.",
      },
      {
        label: "Total casos acumulados",
        value: Number(resumen?.total_casos_acumulados ?? 0),
        description:
          "Registros de enfermedad activos al cierre del mes seleccionado.",
      },
      {
        label: "% incidencia real",
        value: formatPercent(resumen?.incidencia_real),
        description:
          "(Pendientes por tratar + En tratamiento) / Total de palmas * 100.",
      },
      {
        label: "% incidencia acumulada",
        value: formatPercent(resumen?.incidencia_acumulada),
        description: "Total casos acumulados / Total de palmas * 100.",
      },
    ],
    evolutionCards: [
      {
        label: "Pendientes por tratar",
        value: Number(evolucion.pendientes_por_tratar ?? 0),
        description:
          "Casos acumulados sin tratamiento hasta el fin del mes, sin alta y sin erradicacion.",
      },
      {
        label: "En tratamiento",
        value: Number(evolucion.en_recuperacion ?? 0),
        description:
          "Casos acumulados con tratamiento hasta el fin del mes, sin alta y sin erradicacion.",
      },
      {
        label: "Pendientes por erradicar",
        value: Number(evolucion.pendientes_por_erradicar ?? 0),
        description:
          "Palmas que seguian pendientes de erradicacion en el mes seleccionado.",
      },
      {
        label: "Reincidencia",
        value: Number(evolucion.reincidencia ?? 0),
        description:
          "Registros del mes con antecedente previo para la misma palma y enfermedad.",
      },
      {
        label: "De alta",
        value: Number(evolucion.de_alta ?? 0),
        description:
          "Registros dados de alta con al menos un tratamiento dentro del mes seleccionado.",
      },
      {
        label: "Erradicadas",
        value: Number(evolucion.eliminada ?? 0),
        description: "Erradicaciones con fecha dentro del mes seleccionado.",
      },
    ],
  };
}

export function extractMonthlyRecords(
  resumen: MonthlyFitosanitarioSummaryResponse | any
): MonthlyFitosanitarioRegistro[] {
  if (Array.isArray(resumen?.registros)) {
    return resumen.registros;
  }

  if (Array.isArray(resumen?.data?.registros)) {
    return resumen.data.registros;
  }

  return [];
}

export function mapMonthlyIncidences(
  registrosMes: MonthlyFitosanitarioRegistro[]
): IncidenciaMensualRow[] {
  return (registrosMes || []).map((registro) => ({
    id_palma: String(registro?.id_palma ?? "-"),
    nombre_lote: registro?.nombre_lote ?? "-",
    nombre_enfermedad: registro?.nombre_enfermedad ?? "-",
    etapa_enfermedad: registro?.etapa_enfermedad ?? "-",
    estado: registro?.estado ?? "-",
    fecha_registro_enfermedad: registro?.fecha_registro_enfermedad ?? "",
  }));
}

export function buildMonthlyChartSeries(
  registros: MonthlyFitosanitarioRegistro[],
  enfermedadSeleccionada: string
): ChartSeries {
  const safeRegistros = Array.isArray(registros) ? registros : [];
  const key =
    enfermedadSeleccionada && enfermedadSeleccionada !== "Todas"
      ? "etapa_enfermedad"
      : "nombre_enfermedad";
  const etiquetas = Array.from(
    new Set(
      safeRegistros.map((item) => item?.[key]).filter((value) => !!value)
    )
  );
  const labels = etiquetas.length > 0 ? etiquetas : ["Sin datos"];

  return {
    labels,
    data: labels.map((label) => {
      if (label === "Sin datos") {
        return 0;
      }

      return safeRegistros.filter((item) => item?.[key] === label).length;
    }),
  };
}

export function formatPercent(value: number): string {
  const numeric = Number(value ?? 0);
  return `${Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00"}%`;
}

export function formatFechaRegistro(value: string): string {
  if (!value) {
    return "-";
  }

  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) {
    return value;
  }

  return fecha.toLocaleDateString("es-CO");
}

export function formatEstadoActivo(estado: ActivePalmRow["estado"]): string {
  const labelMap: { [key in ActivePalmRow["estado"]]: string } = {
    en_tratamiento: "En tratamiento",
    pendiente_por_tratar: "Pendiente por tratar",
    pendiente_por_erradicar: "Pendiente por erradicar",
  };

  return labelMap[estado] ?? estado;
}

export interface ResumenCard {
  label: string;
  value: number | string;
  description: string;
}

export interface MonthlyFitosanitarioSummaryParams {
  fecha?: string;
  mes?: string;
  lote?: string;
  enfermedad?: string;
}

export interface MonthlyFitosanitarioEvolution {
  pendientes_por_tratar: number;
  en_recuperacion: number;
  pendientes_por_erradicar?: number;
  reincidencia: number;
  de_alta: number;
  eliminada: number;
}

export interface MonthlyFitosanitarioSummaryResponse {
  total_casos_mes: number;
  total_casos_acumulados: number;
  incidencia_real: number;
  incidencia_acumulada: number;
  evolucion: MonthlyFitosanitarioEvolution;
  registros: MonthlyFitosanitarioRegistro[];
}

export interface MonthlyFitosanitarioRegistro {
  id_palma: number | string;
  nombre_enfermedad: string;
  id_registro_enfermedad?: number | string;
  etapa_enfermedad: string;
  nombre_lote: string;
  fecha_registro_enfermedad: string;
  observacion_registro_enfermedad?: string;
  estado?: string;
}

export interface ActivePalmRow {
  nombre_lote: string;
  id_palma: number | string;
  nombre_enfermedad: string;
  etapa_enfermedad: string;
  fecha: string;
  estado:
    | "en_tratamiento"
    | "pendiente_por_tratar"
    | "pendiente_por_erradicar";
}

export interface TotalPalmsByLoteRow {
  nombre_lote: string;
  total_palmas: number;
}

export interface CurrentStateResponse {
  total_palms_by_lote: TotalPalmsByLoteRow[];
  active_palms: ActivePalmRow[];
}

export interface IncidenciaMensualRow {
  id_palma: string;
  nombre_lote: string;
  nombre_enfermedad: string;
  etapa_enfermedad: string;
  estado: string;
  fecha_registro_enfermedad: string;
}

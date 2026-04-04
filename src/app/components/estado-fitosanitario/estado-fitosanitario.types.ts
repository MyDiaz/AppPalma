export interface GraficoArrayMap {
  [key: string]: any[];
}

export interface FechaFiltro {
  year: number;
  month: number;
}

export interface ResumenCard {
  label: string;
  value: number | string;
  description: string;
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

export interface CurrentStateResponse {
  total_palms: number;
  active_palms: ActivePalmRow[];
}

export interface IncidenciaMensualRow {
  id_palma: string;
  nombre_enfermedad: string;
  etapa_enfermedad: string;
  estado: string;
  fecha_registro_enfermedad: string;
}

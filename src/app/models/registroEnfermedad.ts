export class RegistroEnfermedad {
    id_palma: string;
    nombre_enfermedad: string;
    etapa_enfermedad: string;
    nombre_lote: string;
    fecha_registro_enfermedad: string;
    observacion_registro_enfermedad: string;
    tratamiento_etapa_enfermedad?: string;
    procedimiento_tratamiento_enfermedad?: string;
    dada_de_alta?: boolean;
  }

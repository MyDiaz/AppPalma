export class CensoProductivoModel {
  id_censo_productivo: number;
  cantidad_flores_femeninas: number | null;
  cantidad_racimos_verdes: number | null;
  fecha_registro_censo_productivo: Date;
  nombre_lote: string;
  cantidad_palmas_leidas: number | null;
  cantidad_racimos_pintones: number | null;
  cantidad_racimos_sobremaduros: number | null;
  cantidad_racimos_maduros: number | null;
  cantidad_flores_masculinas: number | null;
  cc_usuario: string;
  nombre_usuario: string;
  cargo_empresa: string;
  contrasena_usuario: string;
  rol: string;
  validado: boolean;
}

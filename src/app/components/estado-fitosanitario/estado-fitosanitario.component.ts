import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EnfermedadesService } from "src/app/Servicios/enfermedades.service";
import { ErradicacionesService } from "src/app/Servicios/erradicaciones.service";
import { AgroquimicosService } from "src/app/Servicios/agroquimicos.service";
import {
  EtapaEnfermedad,
  EnfermedadNombre,
} from "src/app/models/enfermedadModel";
import { RegistroEnfermedad } from "src/app/models/registroEnfermedad";
import {
  ActivePalmRow,
  FechaFiltro,
  GraficoArrayMap,
  IncidenciaMensualRow,
  ResumenCard,
  TotalPalmsByLoteRow,
} from "./estado-fitosanitario.types";
//import { Router } from '@angular/router';
import { forkJoin } from "rxjs";
import {
  EstadoFitosanitarioPdfService,
} from "./estado-fitosanitario-pdf.service";

@Component({
  selector: "app-estado-fitosanitario",
  templateUrl: "./estado-fitosanitario.component.html",
  styleUrls: ["./estado-fitosanitario.component.css"],
})
export class EstadoFitosanitarioComponent implements OnInit {
  enfermedades: EnfermedadNombre[] = [];
  etapasEnfermedades: EtapaEnfermedad[] = [];
  graficosData: GraficoArrayMap = {};
  registroEnfermedadesLote: RegistroEnfermedad[] = [];
  nombreLoteParams: string;
  fechaSeleccionada: string = "";
  enfermedadSeleccionada: string = "Todas";

  totalPalmasPorLote: TotalPalmsByLoteRow[] = [];
  totalpalmas: number = 0;
  totalsanas: number = 0;
  totalentratamiento: number = 0;
  palmasSanas: number = 0;
  totalpendientesporerradicar: number = 0;
  totalerradicadas: number;
  pendientesPorTratar: number = 0;
  registrosEnTratamiento = 0;
  registrosDadasDeAlta = 0;
  registrosGlobal: RegistroEnfermedad[] = [];
  erradicacionesGlobal: any[] = [];
  registrosAgroquimicos: any[] = [];
  registrosAgroquimicosFiltrados: any[] = [];

  erradicaciones: any[] = [];
  erradicacionesFiltradasCount = 0;
  loteErradicacionesSeleccionado: string = "Todos";
  lotesErradicaciones: string[] = [];

  casosacumulados: number;
  incidenciareal: number;
  incidenciaacumulada: number;
  casosFiltrados: number = 0;
  incidenciaFiltrada: number = 0;
  estadoCargaMensaje: string = "";
  estadoActualCards: ResumenCard[] = [];
  vistaMensualCards: ResumenCard[] = [];
  activePalms: ActivePalmRow[] = [];
  activePalmsGlobal: ActivePalmRow[] = [];
  monthlyChartLabels: string[] = [];
  monthlyChartData: number[] = [];
  incidenciasMensuales: IncidenciaMensualRow[] = [];
  private loteFiltradoDesdeRuta = "Todos";

  private normalizeLoteName(value: string): string {
    const safe = (value || "").trim().toLowerCase();
    try {
      return decodeURIComponent(safe);
    } catch {
      return safe;
    }
  }
  
  constructor(
    private _enfermedadesService: EnfermedadesService,
    private _erradicacionesService: ErradicacionesService,
    private _agroquimicosService: AgroquimicosService,
    private activatedRoute: ActivatedRoute,
    private _estadoFitosanitarioPdfService: EstadoFitosanitarioPdfService
  ) {}

  ngOnInit() {
    this.loteFiltradoDesdeRuta =
      this.activatedRoute.snapshot.queryParamMap.get("lote") || "Todos";
    this.loteErradicacionesSeleccionado = this.loteFiltradoDesdeRuta;
    this.estadoCargaMensaje = "Cargando datos del lote...";
    this.cargarDatosGenerales();
  }

  private cargarDatosGenerales(): void {
    this.estadoCargaMensaje = "Cargando registros...";
    this.registrosGlobal = [];
    this.erradicacionesGlobal = [];
    this.registrosAgroquimicos = [];
    this.registrosAgroquimicosFiltrados = [];

    forkJoin({
      registros: this._enfermedadesService.getEnfermedadesRegistradas(),
      estadoActual: this._enfermedadesService.getEstadoFitosanitarioActual(),
      erradicaciones: this._erradicacionesService.getErradicaciones(),
      agroquimicos: this._agroquimicosService.getRegistroAgroquimico(),
    }).subscribe(
      ({ registros, estadoActual, erradicaciones, agroquimicos }) => {
        this.registrosGlobal = Array.isArray(registros) ? registros : [];
        this.totalPalmasPorLote = Array.isArray(estadoActual?.total_palms_by_lote)
          ? estadoActual.total_palms_by_lote
          : [];
        this.activePalmsGlobal = Array.isArray(estadoActual?.active_palms)
          ? estadoActual.active_palms
          : [];
        this.erradicacionesGlobal = Array.isArray(erradicaciones)
          ? erradicaciones
          : [];
        this.registrosAgroquimicos = Array.isArray(agroquimicos)
          ? agroquimicos
          : [];
        this.lotesErradicaciones = this.totalPalmasPorLote
          .map((item) => item?.nombre_lote)
          .filter((nombre): nombre is string => !!nombre)
          .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

        this.aplicarFiltroLote(this.loteErradicacionesSeleccionado);
      },
      (error) => {
        console.error(error);
        this.registrosGlobal = [];
        this.erradicacionesGlobal = [];
        this.registrosAgroquimicos = [];
        this.registrosAgroquimicosFiltrados = [];
        this.totalPalmasPorLote = [];
        this.registroEnfermedadesLote = [];
        this.erradicaciones = [];
        this.activePalmsGlobal = [];
        this.activePalms = [];
        this.estadoCargaMensaje =
          "No fue posible cargar los registros del lote.";
      }
    );
  }

  aplicarFiltroLote(loteNombre: string): void {
    this.loteErradicacionesSeleccionado = loteNombre || "Todos";
    const loteValido = loteNombre && loteNombre !== "Todos";
    const filtroNormalizado = loteValido
      ? this.normalizeLoteName(loteNombre)
      : null;

    const registrosFiltrados = this.filtrarPorLote(
      this.registrosGlobal,
      filtroNormalizado
    );
    const erradicacionesFiltradas = this.filtrarPorLote(
      this.erradicacionesGlobal,
      filtroNormalizado
    );
    const agroquimicosFiltrados = this.filtrarPorLote(
      this.registrosAgroquimicos,
      filtroNormalizado
    );

    this.registroEnfermedadesLote = registrosFiltrados;
    this.erradicaciones = erradicacionesFiltradas;
    this.registrosAgroquimicosFiltrados = agroquimicosFiltrados;
    this.nombreLoteParams = loteValido ? loteNombre : "Global";
    this.actualizarTotalPalmas(loteValido ? loteNombre : null);

    this.actualizarCatalogoEnfermedades(registrosFiltrados);
    this.actualizarEtapasDesdeRegistros(registrosFiltrados);
    this.actualizarEstadoActual();
    this.cambiarChart();
  }

  private filtrarPorLote<T extends { nombre_lote?: string }>(
    registros: T[],
    loteNormalizado: string | null
  ): T[] {
    if (!Array.isArray(registros)) {
      return [];
    }
    if (!loteNormalizado) {
      return [...registros];
    }
    return registros.filter(
      (item) =>
        typeof item?.nombre_lote === "string" &&
        this.normalizeLoteName(item.nombre_lote) === loteNormalizado
    );
  }

  private actualizarTotalPalmas(loteNombre: string | null): void {
    if (
      !Array.isArray(this.totalPalmasPorLote) ||
      this.totalPalmasPorLote.length === 0
    ) {
      this.totalpalmas = 0;
      return;
    }

    const loteNormalizado = loteNombre
      ? this.normalizeLoteName(loteNombre)
      : null;

    const lotesSeleccionados = loteNormalizado
      ? this.totalPalmasPorLote.filter((lote) => {
          const nombre = lote?.nombre_lote ?? "";
          return this.normalizeLoteName(nombre) === loteNormalizado;
        })
      : this.totalPalmasPorLote;

    this.totalpalmas = lotesSeleccionados.reduce((total, lote) => {
      const palmas = Number(lote?.total_palmas ?? 0);
      return total + (isNaN(palmas) ? 0 : palmas);
    }, 0);
    this.actualizarPalmasSanas();
  }

  private actualizarPalmasSanas(): void {
    const pendientes = this.pendientesPorTratar ?? 0;
    const enTratamiento = this.registrosEnTratamiento ?? 0;
    const pendientesErradicar = this.totalpendientesporerradicar ?? 0;
    const erradicadas = this.erradicacionesFiltradasCount ?? 0;
    const suma = pendientes + enTratamiento + pendientesErradicar + erradicadas;
    const resultado = (this.totalpalmas ?? 0) - suma;
    this.palmasSanas = resultado > 0 ? resultado : 0;
  }

  private actualizarEstadoActual(): void {
    const activePalms = this.obtenerPalmasActivasFiltradas();
    const palmasTotales = this.totalpalmas ?? 0;
    this.activePalms = activePalms;

    const pendientesPorErradicar = activePalms.filter(
      (item) => item.estado === "pendiente_por_erradicar"
    ).length;
    const enTratamiento = activePalms.filter(
      (item) => item.estado === "en_tratamiento"
    ).length;
    const pendientesPorTratar = activePalms.filter(
      (item) => item.estado === "pendiente_por_tratar"
    ).length;
    const palmasEnfermas =
      enTratamiento + pendientesPorTratar + pendientesPorErradicar;
    const palmasSanas = Math.max(palmasTotales - palmasEnfermas, 0);

    this.estadoActualCards = [
      {
        label: "Total de palmas",
        value: palmasTotales,
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
        description: "Palmas con tratamiento activo y que aún no han recibido alta.",
      },
      {
        label: "Palmas pendientes por tratar",
        value: pendientesPorTratar,
        description: "Palmas enfermas que requieren tratamiento pero aún no lo han iniciado.",
      },
      {
        label: "Palmas pendientes por erradicar",
        value: pendientesPorErradicar,
        description: "Palmas enfermas que deben retirarse porque la enfermedad no tiene cura.",
      },
    ];

    this.totalpalmas = palmasTotales;
    this.registrosEnTratamiento = enTratamiento;
    this.pendientesPorTratar = pendientesPorTratar;
    this.totalpendientesporerradicar = pendientesPorErradicar;
    this.palmasSanas = palmasSanas;
  }

  private obtenerPalmasActivasFiltradas(): ActivePalmRow[] {
    if (!Array.isArray(this.activePalmsGlobal)) {
      return [];
    }

    if (
      !this.loteErradicacionesSeleccionado ||
      this.loteErradicacionesSeleccionado === "Todos"
    ) {
      return [...this.activePalmsGlobal];
    }

    const loteNormalizado = this.normalizeLoteName(
      this.loteErradicacionesSeleccionado
    );

    return this.activePalmsGlobal.filter(
      (item) =>
        this.normalizeLoteName(item?.nombre_lote ?? "") === loteNormalizado
    );
  }

  private actualizarContadorErradicaciones(): void {
    const fechaFiltro = this.obtenerFiltroMesAnio();

    const filtered = this.erradicaciones.filter((item) => {
      if (!item?.fecha_erradicacion) {
        return false;
      }

      const fecha = new Date(item.fecha_erradicacion);
      if (!fecha || Number.isNaN(fecha.getTime())) {
        return false;
      }

      if (fechaFiltro) {
        if (
          fecha.getFullYear() !== fechaFiltro.year ||
          fecha.getMonth() !== fechaFiltro.month
        ) {
          return false;
        }
      }

      return true;
    });

    this.erradicacionesFiltradasCount = filtered.length;
  }

  private actualizarCatalogoEnfermedades(registros: RegistroEnfermedad[]): void {
    const nombresUnicos = Array.from(
      new Set(
        (registros ?? [])
          .map((registro) => registro?.nombre_enfermedad)
          .filter((nombre) => !!nombre)
      )
    );
    this.enfermedades = nombresUnicos.map((nombre) => ({ nombre }));
  }

  private actualizarEtapasDesdeRegistros(registros: RegistroEnfermedad[]): void {
    const etapasMap = new Map<string, EtapaEnfermedad>();
    (registros ?? []).forEach((registro) => {
      const nombre = registro?.nombre_enfermedad;
      const etapa = registro?.etapa_enfermedad;
      if (!nombre || !etapa) {
        return;
      }
      const key = `${nombre}|${etapa}`.toLowerCase();
      if (!etapasMap.has(key)) {
        etapasMap.set(key, {
          nombre_enfermedad: nombre,
          nombre_etapa: etapa,
        });
      }
    });
    this.etapasEnfermedades = Array.from(etapasMap.values());
  }

  private calcularRegistrosDadasDeAlta(
    registros: RegistroEnfermedad[]
  ): number {
    if (!Array.isArray(registros) || registros.length === 0) {
      return 0;
    }
    return registros.filter((registro) => registro.dada_de_alta === true)
      .length;
  }

  private contarPendientesPorErradicar(
    registros: RegistroEnfermedad[]
  ): number {
    if (!Array.isArray(registros) || registros.length === 0) {
      return 0;
    }

    const nombrePudricion = this.normalizeText("Pudrición Cogollo - PC");

    return registros.filter((registro) => {
      const nombre = this.normalizeText(registro?.nombre_enfermedad);
      if (!nombre) {
        return false;
      }

      const etapa = this.normalizeText(registro?.etapa_enfermedad);
      const tratamiento = this.normalizeText(
        registro?.tratamiento_etapa_enfermedad
      );
      const procedimiento = this.normalizeText(
        registro?.procedimiento_tratamiento_enfermedad
      );

      const contieneErradicacion =
        tratamiento.includes("erradicacion") ||
        procedimiento.includes("erradicacion");

      if (contieneErradicacion) {
        return true;
      }

      const esGrado = this.esEtapaGradoValida(etapa);

      if (nombre === nombrePudricion) {
        return !esGrado;
      }

      return esGrado;
    }).length;
  }

  private esEtapaGradoValida(etapa: string): boolean {
    if (!etapa) {
      return false;
    }

    const etapaNormalizada = etapa.replace(/\s+/g, " ").trim();
    const patrones = [
      "grado uno",
      "grado 1",
      "grado dos",
      "grado 2",
      "grado tres",
      "grado 3",
      "grado i",
      "grado ii",
      "grado iii",
      "etapa 1",
      "etapa 2",
      "etapa 3",
      "etapa uno",
      "etapa dos",
      "etapa tres",
      "1",
      "2",
      "3",
    ];

    return patrones.some((patron) => etapaNormalizada.includes(patron));
  }

  private normalizeText(value: unknown): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  private actualizarGraficoMensual(data: RegistroEnfermedad[]) {
    let res: GraficoArrayMap = {};
    for (let i = 0; i < this.enfermedades.length; i++) {
      let filtrados = data.filter(
        (d) => d.nombre_enfermedad === this.enfermedades[i].nombre
      );
      res[this.enfermedades[i].nombre] = filtrados;
    }
    this.graficosData = res;

    const values: string[] = Array.from(
      new Set(data.map((d) => d.nombre_enfermedad).filter((n) => !!n))
    );
    const labels = values.length > 0 ? values : ["Sin datos"];
    const lengths: number[] = [];
    for (let i = 0; i < labels.length; i++) {
      const diseaseName = labels[i];
      if (diseaseName === "Sin datos") {
        lengths.push(0);
        continue;
      }
      lengths.push(data.filter((d) => d.nombre_enfermedad === diseaseName).length);
    }
    this.monthlyChartLabels = labels;
    this.monthlyChartData = lengths;
  }

  private actualizarResumenFiltrado(data: RegistroEnfermedad[]) {
    const cantidad = data?.length ?? 0;
    this.casosFiltrados = cantidad;
    if (this.totalpalmas && this.totalpalmas > 0) {
      this.incidenciaFiltrada = parseFloat(
        ((cantidad * 100) / this.totalpalmas).toFixed(2)
      );
    } else {
      this.incidenciaFiltrada = 0;
    }
  }
  private actualizarGraficoMensualFiltrado(
    data: any[],
    etiquetas: string[],
    hasEtapas: boolean
  ) {
    const lengths: number[] = [];

    for (let i = 0; i < etiquetas.length; i++) {
      if (hasEtapas) {
        let filtrados = data.filter((d) => etiquetas[i] === d.etapa_enfermedad);
        lengths.push(filtrados.length);
      } else {
        let filtrados = data.filter(
          (d) => etiquetas[i] === d.nombre_enfermedad
        );
        lengths.push(filtrados.length);
      }
    }
    this.monthlyChartLabels = etiquetas;
    this.monthlyChartData = lengths;
  }

  private obtenerFiltroMesAnio(): FechaFiltro | null {
    if (!this.fechaSeleccionada) {
      return null;
    }

    const parsed = new Date(this.fechaSeleccionada);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth(),
    };
  }

  private filtrarRegistrosPorFecha(
    registros: RegistroEnfermedad[],
    filtro: FechaFiltro | null
  ): RegistroEnfermedad[] {
    if (!Array.isArray(registros)) {
      return [];
    }
    if (!filtro) {
      return registros;
    }

    return registros.filter((registro) => {
      const fecha = new Date(registro.fecha_registro_enfermedad);
      if (Number.isNaN(fecha.getTime())) {
        return false;
      }

      return (
        fecha.getFullYear() === filtro.year &&
        fecha.getMonth() === filtro.month
      );
    });
  }

  private actualizarPendientesPorTratarDesdeRegistros(registros: RegistroEnfermedad[]) {
    const totalRegistros = registros?.length ?? 0;
    const pendientesPorErradicar = this.totalpendientesporerradicar ?? 0;
    const diferencia = totalRegistros - pendientesPorErradicar;
    this.pendientesPorTratar = diferencia > 0 ? diferencia : 0;
  }

  private actualizarEnTratamiento() {
    this.registrosEnTratamiento = this.registrosAgroquimicosFiltrados.length;
  }

  private actualizarPendientePorErradicar(registros: RegistroEnfermedad[]) {
    this.totalpendientesporerradicar =
      this.contarPendientesPorErradicar(registros);
  }

  private actualizarDadasDeAlta(registros: RegistroEnfermedad[]) {
    this.registrosDadasDeAlta = this.calcularRegistrosDadasDeAlta(registros);
  }

  private actualizarTarjetasFiltradas(registros: RegistroEnfermedad[]) {
    this.actualizarEnTratamiento();
    this.actualizarDadasDeAlta(registros);
    this.actualizarPendientePorErradicar(registros);
    this.actualizarPendientesPorTratarDesdeRegistros(registros);
    this.actualizarResumenFiltrado(registros);
    this.actualizarPalmasSanas();
  }

  private construirVistaMensualCards(registrosMes: RegistroEnfermedad[]): void {
    const tratamientosMes = this.contarRegistrosDelMes(
      this.registrosAgroquimicosFiltrados,
      "fecha_registro_tratamiento"
    );
    const erradicacionesMes = this.contarRegistrosDelMes(
      this.erradicaciones,
      "fecha_erradicacion"
    );
    const altasMes = 0;
    const pendientesPorTratar = this.pendientesPorTratar ?? 0;
    const enRecuperacion = this.obtenerEnRecuperacionMock(registrosMes);
    const totalCasosAcumulados = pendientesPorTratar + enRecuperacion;
    const incidenciaReal =
      this.totalpalmas && this.totalpalmas > 0
        ? parseFloat(
            (
              ((pendientesPorTratar + enRecuperacion) * 100) /
              this.totalpalmas
            ).toFixed(2)
          )
        : 0;

    this.vistaMensualCards = [
      {
        label: "Casos registrados del mes",
        value: registrosMes.length,
        description: "Cantidad de incidencias registradas en el mes seleccionado.",
      },
      {
        label: "Tratamientos aplicados",
        value: tratamientosMes,
        description: "Aplicaciones o tratamientos registrados durante el mes seleccionado.",
      },
      {
        label: "Erradicaciones del mes",
        value: erradicacionesMes,
        description: "Casos erradicados con fecha dentro del mes seleccionado.",
      },
      {
        label: "Altas del mes",
        value: altasMes,
        description: "Casos cerrados o dados de alta durante el mes seleccionado.",
      },
      {
        label: "Pendientes por tratar",
        value: pendientesPorTratar,
        description: "Casos acumulados del mes que siguen pendientes de tratamiento.",
      },
      {
        label: "En recuperación",
        value: enRecuperacion,
        description: "Casos en seguimiento posterior al tratamiento. Valor visual temporal.",
      },
      {
        label: "Total casos acumulados",
        value: totalCasosAcumulados,
        description: "Casos que permanecen sin resolverse al cierre del mes seleccionado.",
      },
      {
        label: "Incidencia real (%)",
        value: incidenciaReal,
        description: "((Pendientes por tratar + En recuperación) * 100) / Total de palmas.",
      },
    ];
  }

  private actualizarIncidenciasMensuales(registrosMes: RegistroEnfermedad[]): void {
    this.incidenciasMensuales = registrosMes.map((registro) => ({
      id_palma: registro?.id_palma ?? "-",
      nombre_enfermedad: registro?.nombre_enfermedad ?? "-",
      etapa_enfermedad: registro?.etapa_enfermedad ?? "-",
      estado: this.obtenerEstadoRegistro(registro),
      fecha_registro_enfermedad: registro?.fecha_registro_enfermedad ?? "",
    }));
  }

  private obtenerEstadoRegistro(registro: RegistroEnfermedad): string {
    if (registro?.dada_de_alta) {
      return "Dada de alta";
    }

    const requiereErradicacion = this.contarPendientesPorErradicar([registro]) > 0;
    if (requiereErradicacion) {
      return "Pendiente por erradicar";
    }

    const tieneTratamiento = this.registrosAgroquimicosFiltrados.some((item) => {
      const mismaPalma =
        String(item?.id_palma ?? "").trim() === String(registro?.id_palma ?? "").trim();
      const mismaEnfermedad =
        this.normalizeText(item?.nombre_enfermedad) ===
        this.normalizeText(registro?.nombre_enfermedad);
      return mismaPalma || (mismaEnfermedad && item?.nombre_lote === registro?.nombre_lote);
    });

    if (tieneTratamiento) {
      return "En tratamiento";
    }

    return "Pendiente por tratar";
  }

  private contarRegistrosDelMes(
    registros: any[],
    fechaKey: string
  ): number {
    const filtroFecha = this.obtenerFiltroMesAnio();
    if (!Array.isArray(registros) || !filtroFecha) {
      return 0;
    }

    return registros.filter((item) => {
      const fecha = new Date(item?.[fechaKey]);
      if (Number.isNaN(fecha.getTime())) {
        return false;
      }

      return (
        fecha.getFullYear() === filtroFecha.year &&
        fecha.getMonth() === filtroFecha.month
      );
    }).length;
  }

  private obtenerEnRecuperacionMock(registrosMes: RegistroEnfermedad[]): number {
    if (!Array.isArray(registrosMes) || registrosMes.length === 0) {
      return 0;
    }

    return Math.min(
      Math.floor(this.registrosAgroquimicosFiltrados.length / 2),
      registrosMes.length
    );
  }

  formatFechaRegistro(value: string): string {
    if (!value) {
      return "-";
    }

    const fecha = new Date(value);
    if (Number.isNaN(fecha.getTime())) {
      return value;
    }

    return fecha.toLocaleDateString("es-CO");
  }

  cambiarChart() {
    const filtroFecha = this.obtenerFiltroMesAnio();
    const registrosPorFecha = this.filtrarRegistrosPorFecha(
      this.registroEnfermedadesLote,
      filtroFecha
    );
    let datosFiltrados = registrosPorFecha;
    if (this.enfermedadSeleccionada != "Todas") {
      const newDataFiltrada = registrosPorFecha.filter(
        (d) => d.nombre_enfermedad === this.enfermedadSeleccionada
      );
      const etapas = this.etapasEnfermedades.filter(
        (d) => d.nombre_enfermedad === this.enfermedadSeleccionada
      );
      const etiquetas = etapas.length
        ? etapas.map((obj) => obj.nombre_etapa)
        : [this.enfermedadSeleccionada];
      this.actualizarGraficoMensualFiltrado(
        newDataFiltrada,
        etiquetas,
        etapas.length > 0
      );
      datosFiltrados = newDataFiltrada;
    } else {
      this.actualizarGraficoMensual(registrosPorFecha);
    }
    this.actualizarTarjetasFiltradas(datosFiltrados);
    this.actualizarContadorErradicaciones();
    this.construirVistaMensualCards(registrosPorFecha);
    this.actualizarIncidenciasMensuales(registrosPorFecha);
    const sinRegistros = registrosPorFecha.length === 0;
    if (sinRegistros) {
      const baseMensaje =
        this.loteErradicacionesSeleccionado &&
        this.loteErradicacionesSeleccionado !== "Todos"
          ? "No hay registros disponibles para el lote seleccionado"
          : "No hay registros disponibles";
      const sufijo = this.fechaSeleccionada
        ? " para ese mes y año."
        : ".";
      this.estadoCargaMensaje = `${baseMensaje}${sufijo}`;
    } else {
      this.estadoCargaMensaje = "";
    }
  }

  crearPdf() {
    const canvas = document.getElementById("myChart") as HTMLCanvasElement;
    this._estadoFitosanitarioPdfService.generarPdf({
      nombreLoteParams: this.nombreLoteParams,
      totalpalmas: this.totalpalmas,
      totalsanas: this.totalsanas,
      pendientesPorTratar: this.pendientesPorTratar,
      registrosEnTratamiento: this.registrosEnTratamiento,
      totalpendientesporerradicar: this.totalpendientesporerradicar,
      totalerradicadas: this.totalerradicadas,
      registroEnfermedadesLoteLength: this.registroEnfermedadesLote.length,
      incidenciareal: this.incidenciareal,
      casosacumulados: this.casosacumulados,
      incidenciaacumulada: this.incidenciaacumulada,
      chartCanvas: canvas,
    });
  }
}

import { Component, OnInit } from "@angular/core";
import { LoteService } from "../../Servicios/lote.service";
import { EnfermedadesService } from "src/app/Servicios/enfermedades.service";
import { ErradicacionesService } from "src/app/Servicios/erradicaciones.service";
import { Chart } from "chart.js";
import {
  EtapaEnfermedad,
  EnfermedadNombre,
} from "src/app/models/enfermedadModel";
import { RegistroEnfermedad } from "src/app/models/registroEnfermedad";
//import { Router } from '@angular/router';
import { jsPDF } from "jspdf";
import { forkJoin } from "rxjs";

interface GraficoArrayMap {
  [key: string]: any[]; // Index signature with string keys and array values
}

interface FechaFiltro {
  year: number;
  month: number;
}

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
  chart: Chart;
  fechaSeleccionada: string = "";
  enfermedadSeleccionada: string = "Todas";

  totalpalmas: number;
  totalsanas: number;
  totalentratamiento: number;
  totalpendientesportratar: number;
  totalpendientesporerradicar: number = 0;
  totalerradicadas: number;
  registrosPendientesPorTratar: RegistroEnfermedad[] = [];
  pendientesPorTratarDesdeServicio = 0;
  registrosEnTratamiento = 0;
  registrosDadasDeAlta = 0;
  registrosGlobal: RegistroEnfermedad[] = [];
  pendientesGlobal: RegistroEnfermedad[] = [];
  erradicacionesGlobal: any[] = [];

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

  private normalizeLoteName(value: string): string {
    const safe = (value || "").trim().toLowerCase();
    try {
      return decodeURIComponent(safe);
    } catch {
      return safe;
    }
  }
  
  constructor(
    private _loteService: LoteService,
    private _enfermedadesService: EnfermedadesService,
    private _erradicacionesService: ErradicacionesService
  ) {}

  ngOnInit() {
    this.estadoCargaMensaje = "Cargando datos del lote...";
    this.cargarLotesDisponibles();
    this.cargarDatosGenerales();
  }

  private cargarDatosGenerales(): void {
    this.estadoCargaMensaje = "Cargando registros...";
    this.registrosGlobal = [];
    this.pendientesGlobal = [];
    this.erradicacionesGlobal = [];

    forkJoin({
      registros: this._enfermedadesService.getEnfermedadesRegistradas(),
      pendientes: this._enfermedadesService.getPendientesPorTratar(),
      erradicaciones: this._erradicacionesService.getErradicaciones(),
    }).subscribe(
      ({ registros, pendientes, erradicaciones }) => {
        this.registrosGlobal = Array.isArray(registros) ? registros : [];
        this.pendientesGlobal = Array.isArray(pendientes) ? pendientes : [];
        this.erradicacionesGlobal = Array.isArray(erradicaciones)
          ? erradicaciones
          : [];

        this.aplicarFiltroLote(this.loteErradicacionesSeleccionado);
      },
      (error) => {
        console.error(error);
        this.registrosGlobal = [];
        this.pendientesGlobal = [];
        this.erradicacionesGlobal = [];
        this.registroEnfermedadesLote = [];
        this.registrosPendientesPorTratar = [];
        this.erradicaciones = [];
        this.estadoCargaMensaje =
          "No fue posible cargar los registros del lote.";
      }
    );
  }

  private cargarLotesDisponibles(): void {
    this._loteService.getLotes().subscribe(
      (data) => {
        const nombres = Array.from(
          new Set(
            (data ?? [])
              .map((lote) => lote?.nombre_lote ?? lote?.nombre)
              .filter((nombre) => !!nombre)
          )
        );
        this.lotesErradicaciones = nombres.sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
      },
      (error) => {
        console.error(error);
        this.estadoCargaMensaje =
          "No fue posible cargar los lotes disponibles.";
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
    const pendientesFiltrados = this.filtrarPorLote(
      this.pendientesGlobal,
      filtroNormalizado
    );
    const erradicacionesFiltradas = this.filtrarPorLote(
      this.erradicacionesGlobal,
      filtroNormalizado
    );

    this.registroEnfermedadesLote = registrosFiltrados;
    this.registrosPendientesPorTratar = pendientesFiltrados;
    this.erradicaciones = erradicacionesFiltradas;
    this.nombreLoteParams = loteValido ? loteNombre : "Global";

    this.actualizarCatalogoEnfermedades(registrosFiltrados);
    this.actualizarEtapasDesdeRegistros(registrosFiltrados);
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

  private calcularCantidadRegistrosPendientes(
    registros: RegistroEnfermedad[]
  ): number {
    return registros?.length ?? 0;
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

  createChart(data: RegistroEnfermedad[]) {
    const canvas = document.getElementById("myChart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

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

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "# de casos",
            data: lengths,
            backgroundColor: "red",
          },
        ],
      },
      options: {
        events: [],
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
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
  createChartFiltrado(data: any[], etiquetas: string[], hasEtapas: boolean) {
    const canvas = document.getElementById("myChart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
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

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: "# de casos",
            data: lengths,
            backgroundColor: "red",
            barPercentage: 0.2,
            categoryPercentage: 1,
          },
        ],
      },
      options: {
        events: [],
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
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

  private calcularPendientesPorTratarPorFecha(filtro: FechaFiltro | null): number {
    if (!Array.isArray(this.registrosPendientesPorTratar)) {
      return 0;
    }
    if (!filtro) {
      return this.registrosPendientesPorTratar.length;
    }

    return this.registrosPendientesPorTratar.filter((registro) => {
      const fecha = new Date(registro.fecha_registro_enfermedad);
      if (Number.isNaN(fecha.getTime())) {
        return false;
      }

      return (
        fecha.getFullYear() === filtro.year &&
        fecha.getMonth() === filtro.month
      );
    }).length;
  }

  private actualizarPendientesPorTratar(filtro: FechaFiltro | null) {
    this.pendientesPorTratarDesdeServicio =
      this.calcularPendientesPorTratarPorFecha(filtro);
  }

  private actualizarEnTratamiento(registros: RegistroEnfermedad[]) {
    this.registrosEnTratamiento = registros.length;
  }

  private actualizarPendientePorErradicar(registros: RegistroEnfermedad[]) {
    this.totalpendientesporerradicar =
      this.contarPendientesPorErradicar(registros);
  }

  private actualizarDadasDeAlta(registros: RegistroEnfermedad[]) {
    this.registrosDadasDeAlta = this.calcularRegistrosDadasDeAlta(registros);
  }

  private actualizarTarjetasFiltradas(
    registros: RegistroEnfermedad[],
    filtro: FechaFiltro | null
  ) {
    this.actualizarEnTratamiento(registros);
    this.actualizarDadasDeAlta(registros);
    this.actualizarPendientePorErradicar(registros);
    this.actualizarPendientesPorTratar(filtro);
    this.actualizarResumenFiltrado(registros);
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
      this.createChartFiltrado(newDataFiltrada, etiquetas, etapas.length > 0);
      datosFiltrados = newDataFiltrada;
    } else {
      this.createChart(registrosPorFecha);
    }
    this.actualizarTarjetasFiltradas(datosFiltrados, filtroFecha);
    this.actualizarContadorErradicaciones();
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
    const doc = new jsPDF();

    const xCol1 = 15;
    let xCol2 = 115;
    const yLine1 = 85;
    const lineOffset = 20;
    let col1Offset = 60;
    let col2Offset = 40;

    doc.setFontSize(36);
    doc.text("Estado Fitosanitario", 45, 35);
    doc.setFontSize(24);
    doc.text(`Lote: ${this.nombreLoteParams}`, 20, 60);

    // Conteo de palmas
    doc.setFontSize(14);
    doc.text("Total de palmas:", xCol1, yLine1);
    doc.text("Sanas:", xCol2, yLine1);
    doc.text("Pendientes por tratar:", xCol1, yLine1 + lineOffset);
    doc.text("En tratamiento:", xCol2, yLine1 + lineOffset);
    doc.text("Pendiente por erradicar:", xCol1, yLine1 + 2 * lineOffset);
    doc.text("Erradicadas:", xCol2, yLine1 + 2 * lineOffset);
    doc.setFontSize(11);
    doc.text(`${this.totalpalmas}`, xCol1 + col1Offset, yLine1);
    doc.text(`${this.totalsanas}`, xCol2 + col2Offset, yLine1);
    doc.text(
      `${this.pendientesPorTratarDesdeServicio}`,
      xCol1 + col1Offset,
      yLine1 + lineOffset
    );
    doc.text(`${this.registrosEnTratamiento}`, xCol2 + col2Offset, yLine1 + lineOffset);
    doc.text(`${this.totalpendientesporerradicar}`, xCol1 + col1Offset, yLine1 + 2 * lineOffset);
    doc.text(`${this.totalerradicadas}`, xCol2 + col2Offset, yLine1 + 2 * lineOffset);

    // Grafica
    const canvas = document.getElementById("myChart") as HTMLCanvasElement;
    doc.addImage(canvas, 'PNG', 15, 160, 180, 100);

    // Conteo de enfermedades e incidencias
    doc.addPage();
    const yLine4 = 30;
    xCol2 = 95;
    col1Offset = 50;
    col2Offset = 65;
    doc.setFontSize(14);
    doc.text("Casos totales:", xCol1, yLine4);
    doc.text("Incidencia real (%):", xCol2, yLine4);
    doc.text("Casos acumulados:", xCol1, yLine4 + lineOffset);
    doc.text("Incidencia acumulada (%):", xCol2, yLine4 + lineOffset);
    doc.setFontSize(11);
    doc.text(`${this.registroEnfermedadesLote.length}`, xCol1 + col1Offset, yLine4);
    doc.text(`${this.incidenciareal}`, xCol2 + col2Offset, yLine4);
    doc.text(`${this.casosacumulados}`, xCol1 + col1Offset, yLine4 + lineOffset);
    doc.text(`${this.incidenciaacumulada}`, xCol2 + col2Offset, yLine4 + lineOffset);

    doc.save(`Estado_Fitosanitario-${this.nombreLoteParams}.pdf`);
  }
}

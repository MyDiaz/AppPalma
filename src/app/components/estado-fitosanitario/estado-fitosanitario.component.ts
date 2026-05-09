import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EnfermedadesService } from "src/app/Servicios/enfermedades.service";
import { EnfermedadNombre } from "src/app/models/enfermedadModel";
import {
  ActivePalmRow,
  IncidenciaMensualRow,
  MonthlyFitosanitarioSummaryResponse,
  ResumenCard,
  TotalPalmsByLoteRow,
} from "./estado-fitosanitario.types";
//import { Router } from '@angular/router';
import { forkJoin } from "rxjs";
import {
  EstadoFitosanitarioPdfService,
} from "./estado-fitosanitario-pdf.service";
import {
  buildCurrentStateCards,
  buildMonthlyCards,
  buildMonthlyChartSeries,
  extractMonthlyRecords,
  mapMonthlyIncidences,
} from "./estado-fitosanitario.helpers";

@Component({
  selector: "app-estado-fitosanitario",
  templateUrl: "./estado-fitosanitario.component.html",
  styleUrls: ["./estado-fitosanitario.component.css"],
})
export class EstadoFitosanitarioComponent implements OnInit {
  enfermedades: EnfermedadNombre[] = [];
  nombreLoteParams: string;
  fechaSeleccionada: string = this.obtenerMesActual();
  enfermedadSeleccionada: string = "Todas";

  totalPalmasPorLote: TotalPalmsByLoteRow[] = [];
  totalpalmas: number = 0;
  loteErradicacionesSeleccionado: string = "Todos";
  lotesErradicaciones: string[] = [];

  estadoCargaMensaje: string = "";
  vistaMensualMainCards: ResumenCard[] = [];
  vistaMensualEvolutionCards: ResumenCard[] = [];
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

    forkJoin({
      estadoActual: this._enfermedadesService.getEstadoFitosanitarioActual(),
      enfermedades: this._enfermedadesService.getEnfermedades(),
    }).subscribe(
      ({ estadoActual, enfermedades }) => {
        this.totalPalmasPorLote = Array.isArray(estadoActual?.total_palms_by_lote)
          ? estadoActual.total_palms_by_lote
          : [];
        this.activePalmsGlobal = Array.isArray(estadoActual?.active_palms)
          ? estadoActual.active_palms
          : [];
        this.enfermedades = this.normalizarCatalogoEnfermedades(enfermedades);
        this.lotesErradicaciones = this.totalPalmasPorLote
          .map((item) => item?.nombre_lote)
          .filter((nombre): nombre is string => !!nombre)
          .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

        this.aplicarFiltroLote(this.loteErradicacionesSeleccionado);
      },
      (error) => {
        console.error(error);
        this.totalPalmasPorLote = [];
        this.activePalmsGlobal = [];
        this.activePalms = [];
        this.enfermedades = [];
        this.estadoCargaMensaje =
          "No fue posible cargar los registros del lote.";
      }
    );
  }

  aplicarFiltroLote(loteNombre: string): void {
    this.loteErradicacionesSeleccionado = loteNombre || "Todos";
    const loteValido = loteNombre && loteNombre !== "Todos";
    this.nombreLoteParams = loteValido ? loteNombre : "Global";
    this.actualizarTotalPalmas(loteValido ? loteNombre : null);

    this.activePalms = this.obtenerPalmasActivasFiltradas();
    this.cargarInformeMensualFitosanitario();
  }

  private obtenerMesActual(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, "0");
    return `${today.getFullYear()}-${month}`;
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

  private normalizarCatalogoEnfermedades(data: any): EnfermedadNombre[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const nombres = data
      .map((item) => item?.nombre ?? item?.nombre_enfermedad)
      .filter((nombre) => !!nombre);

    return Array.from(new Set(nombres))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((nombre) => ({ nombre }));
  }

  private construirVistaMensualCardsDesdeResumen(
    resumen: MonthlyFitosanitarioSummaryResponse
  ): void {
    const monthlyCards = buildMonthlyCards(resumen);
    this.vistaMensualMainCards = monthlyCards.mainCards;
    this.vistaMensualEvolutionCards = monthlyCards.evolutionCards;
  }

  private actualizarIncidenciasMensuales(
    registrosMes: MonthlyFitosanitarioSummaryResponse["registros"]
  ): void {
    this.incidenciasMensuales = mapMonthlyIncidences(registrosMes);
  }

  private construirEstadoActualCards(): ResumenCard[] {
    return buildCurrentStateCards(this.activePalms, this.totalpalmas);
  }

  private actualizarGraficoMensualDesdeRegistros(
    registros: MonthlyFitosanitarioSummaryResponse["registros"]
  ): void {
    const series = buildMonthlyChartSeries(
      registros,
      this.enfermedadSeleccionada
    );
    this.monthlyChartLabels = series.labels;
    this.monthlyChartData = series.data;
  }

  cambiarChart() {
    this.cargarInformeMensualFitosanitario();
  }

  private cargarInformeMensualFitosanitario(): void {
    this._enfermedadesService
      .getInformeMensualFitosanitario({
        mes: this.fechaSeleccionada,
        lote: this.loteErradicacionesSeleccionado || "Todos",
        enfermedad: this.enfermedadSeleccionada || "Todas",
      })
      .subscribe(
        (resumen) => {
          const registros = extractMonthlyRecords(resumen);
          this.construirVistaMensualCardsDesdeResumen(resumen);
          this.actualizarGraficoMensualDesdeRegistros(registros);
          this.actualizarIncidenciasMensuales(registros);
          if (registros.length === 0) {
            const baseMensaje =
              this.loteErradicacionesSeleccionado &&
              this.loteErradicacionesSeleccionado !== "Todos"
                ? "No hay registros disponibles para el lote seleccionado"
                : "No hay registros disponibles";
            const sufijo = this.fechaSeleccionada ? " para ese mes y anio." : ".";
            this.estadoCargaMensaje = `${baseMensaje}${sufijo}`;
          } else {
            this.estadoCargaMensaje = "";
          }
        },
        (error) => {
          console.error(error);
          this.construirVistaMensualCardsDesdeResumen({
            total_casos_mes: 0,
            total_casos_acumulados: 0,
            incidencia_real: 0,
            incidencia_acumulada: 0,
            evolucion: {
              pendientes_por_tratar: 0,
              en_recuperacion: 0,
              pendientes_por_erradicar: 0,
              reincidencia: 0,
              de_alta: 0,
              eliminada: 0,
            },
            registros: [],
          });
          this.actualizarGraficoMensualDesdeRegistros([]);
          this.actualizarIncidenciasMensuales([]);
          this.estadoCargaMensaje =
            "No fue posible cargar el resumen mensual.";
        }
      );
  }

  crearPdf() {
    const estadoActualCanvases = document.querySelectorAll(
      "app-estado-actual-fitosanitario canvas"
    ) as NodeListOf<HTMLCanvasElement>;
    const monthlyCanvas = document.querySelector(
      "app-vista-mensual-fitosanitario canvas"
    ) as HTMLCanvasElement;
    const currentCards = this.construirEstadoActualCards();

    this._estadoFitosanitarioPdfService.generarPdf({
      nombreLoteParams: this.nombreLoteParams,
      fechaSeleccionada: this.fechaSeleccionada,
      enfermedadSeleccionada: this.enfermedadSeleccionada,
      chartCanvas: monthlyCanvas,
      overviewChartCanvas: estadoActualCanvases.item(0),
      diseaseChartCanvas: estadoActualCanvases.item(1),
      monthlyChartCanvas: monthlyCanvas,
      currentCards,
      monthlyMainCards: this.vistaMensualMainCards,
      monthlyEvolutionCards: this.vistaMensualEvolutionCards,
      activePalms: this.activePalms.map((palma) => ({
        ...palma,
        estado: palma.estado,
      })),
      incidenciasMensuales: this.incidenciasMensuales,
    });
  }
}

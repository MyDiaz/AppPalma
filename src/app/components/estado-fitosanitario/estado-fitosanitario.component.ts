import { Component, OnInit } from "@angular/core";
import { LoteService } from "../../Servicios/lote.service";
import { EnfermedadesService } from "src/app/Servicios/enfermedades.service";
import { ErradicacionesService } from "src/app/Servicios/erradicaciones.service";
import { ActivatedRoute } from "@angular/router";
import { Chart } from "chart.js";
import {
  EtapaEnfermedad,
  EnfermedadNombre,
} from "src/app/models/enfermedadModel";
import { RegistroEnfermedad } from "src/app/models/registroEnfermedad";
import { LoteModel } from "src/app/models/lote.models";
import { PalmaModel } from "src/app/models/palma.model";
//import { Router } from '@angular/router';
import { jsPDF } from "jspdf";
import { forkJoin } from "rxjs";

interface GraficoArrayMap {
  [key: string]: any[]; // Index signature with string keys and array values
}

@Component({
  selector: "app-estado-fitosanitario",
  templateUrl: "./estado-fitosanitario.component.html",
  styleUrls: ["./estado-fitosanitario.component.css"],
})
export class EstadoFitosanitarioComponent implements OnInit {
  lote: LoteModel;
  enfermedades: EnfermedadNombre[] = [];
  etapasEnfermedades: EtapaEnfermedad[] = [];
  graficosData: GraficoArrayMap = {};
  registroEnfermedadesLote: RegistroEnfermedad[] = [];
  nombreLoteParams: string;
  chart: Chart;
  mesSeleccionado: string = "Todos";
  yearSeleccionado: string = "Todos";
  availableYears: string[] = [];
  enfermedadSeleccionada: string = "Todas";

  totalpalmas: number;
  totalsanas: number;
  totalentratamiento: number;
  totalpendientesportratar: number;
  totalpendientesporerradicar: number;
  totalerradicadas: number;

  erradicaciones: any[] = [];
  erradicacionesFiltradasCount = 0;
  loteErradicacionesSeleccionado: string = "Todos";
  lotesErradicaciones: string[] = [];

  casosmes: number;
  casosacumulados: number;
  incidenciareal: number;
  incidenciaacumulada: number;
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
    private _erradicacionesService: ErradicacionesService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.nombreLoteParams = params.get("lote");
      if (!this.nombreLoteParams) {
        this.estadoCargaMensaje = "No se recibió el parámetro de lote en la URL.";
        return;
      }
      this.estadoCargaMensaje = "";
      this.loteErradicacionesSeleccionado =
        this.nombreLoteParams || "Todos";
      this.cargarLotesErradicaciones();
      this.cargarErradicaciones();

      this._loteService.getLote(this.nombreLoteParams).subscribe(
        (lote: LoteModel) => {
          this.lote = lote;
          this._loteService.getPalmasLote(this.nombreLoteParams).subscribe(
            (palmas: PalmaModel[]) => {
              console.log("palmas.length", palmas.length);
              this.totalentratamiento = palmas.filter(
                (p) => p.estado_palma === "En tratamiento"
              ).length;
              this.totalpendientesportratar = palmas.filter(
                (p) => p.estado_palma === "Pendiente por tratar"
              ).length;
              this.totalpendientesporerradicar = palmas.filter(
                (p) => p.estado_palma === "Pendiente por erradicar"
              ).length;
              this.totalerradicadas = palmas.filter(
                (p) => p.estado_palma === "Erradicada"
              ).length;
              this.totalpalmas = this.lote.numero_palmas - this.totalerradicadas;
              this.totalsanas = this.totalpalmas - (this.totalentratamiento + this.totalpendientesportratar + this.totalpendientesporerradicar + this.totalerradicadas);
              this.incidenciareal = parseFloat((100*(this.totalentratamiento + this.totalpendientesportratar)/this.totalpalmas).toFixed(2));
              this.casosacumulados = palmas.length;
              this.incidenciaacumulada = parseFloat((100*(this.casosacumulados)/this.totalpalmas).toFixed(2));
            },
            (error) => {
              console.error(error);
            }
          );
        },
        (error) => {
          console.error(error);
        }
      );

      forkJoin({
        enfermedades: this._loteService.getEnfermedadesServer(),
        registros: this._enfermedadesService.getEnfermedadesRegistradas(),
      }).subscribe(
        ({ enfermedades, registros }) => {
          const fromCatalog = enfermedades.map((e) => e.nombre);
          const fromRegistros = registros
            .map((r) => r.nombre_enfermedad)
            .filter((n) => !!n);
          const uniqueNames = Array.from(new Set([...fromCatalog, ...fromRegistros]));
          this.enfermedades = uniqueNames.map((nombre) => ({ nombre }));

          const loteParam = this.normalizeLoteName(this.nombreLoteParams);
          this.registroEnfermedadesLote = registros.filter(
            (d) => this.normalizeLoteName(d.nombre_lote) === loteParam
          );
          this.availableYears = Array.from(
            new Set(
              this.registroEnfermedadesLote
                .map((r) => new Date(r.fecha_registro_enfermedad).getFullYear())
                .filter((y) => !Number.isNaN(y))
                .map((y) => String(y))
            )
          ).sort((a, b) => Number(b) - Number(a));

          if (
            this.yearSeleccionado !== "Todos" &&
            !this.availableYears.includes(this.yearSeleccionado)
          ) {
            this.yearSeleccionado = "Todos";
          }

          if (this.registroEnfermedadesLote.length === 0) {
            this.estadoCargaMensaje =
              "No hay registros de enfermedades para este lote.";
          }
          this.createChart(this.registroEnfermedadesLote);
        },
        (error) => {
          console.error(error);
          this.estadoCargaMensaje =
            "No fue posible cargar enfermedades registradas.";
        }
      );
    });

    this._loteService.getEtapasServer().subscribe(
      (aux: EtapaEnfermedad[]) => {
        this.etapasEnfermedades = aux;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  private cargarErradicaciones(): void {
    this._erradicacionesService.getErradicaciones().subscribe(
      (data) => {
        this.erradicaciones = data ?? [];
        this.actualizarContadorErradicaciones();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  private cargarLotesErradicaciones(): void {
    this._loteService.getLotes().subscribe(
      (data) => {
        const nombres = Array.from(
          new Set(
            (data ?? [])
              .map((lote) => lote.nombre_lote)
              .filter((nombre) => !!nombre)
          )
        );
        if (
          this.nombreLoteParams &&
          !nombres.some(
            (nombre) =>
              this.normalizeLoteName(nombre) ===
              this.normalizeLoteName(this.nombreLoteParams)
          )
        ) {
          nombres.push(this.nombreLoteParams);
        }
        this.lotesErradicaciones = nombres.sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  private actualizarContadorErradicaciones(): void {
    const loteFiltro =
      this.loteErradicacionesSeleccionado &&
      this.loteErradicacionesSeleccionado !== "Todos"
        ? this.normalizeLoteName(this.loteErradicacionesSeleccionado)
        : null;

    const filtered = this.erradicaciones.filter((item) => {
      if (loteFiltro) {
        const nombreLoteItem = this.normalizeLoteName(item.nombre_lote);
        if (nombreLoteItem !== loteFiltro) {
          return false;
        }
      }

      if (!item?.fecha_erradicacion) {
        return false;
      }

      const fecha = new Date(item.fecha_erradicacion);
      if (!fecha || Number.isNaN(fecha.getTime())) {
        return false;
      }

      if (
        this.yearSeleccionado !== "Todos" &&
        fecha.getFullYear() !== Number.parseInt(this.yearSeleccionado, 10)
      ) {
        return false;
      }

      if (
        this.mesSeleccionado !== "Todos" &&
        fecha.getMonth() !== Number.parseInt(this.mesSeleccionado, 10)
      ) {
        return false;
      }

      return true;
    });

    this.erradicacionesFiltradasCount = filtered.length;
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

  cambiarChart() {
    let newData = [];
    //Aqui filtra por año o por mes si se ha seleccionado
    if (this.yearSeleccionado != "Todos" || this.mesSeleccionado != "Todos") {
      const filteredData = this.registroEnfermedadesLote.filter((obj) => {
        const date = new Date(obj.fecha_registro_enfermedad);
        const objectYear = date.getFullYear();
        const objectMonth = date.getMonth();
        return (
          (this.yearSeleccionado === "Todos" ||
            objectYear === parseInt(this.yearSeleccionado)) &&
          (this.mesSeleccionado === "Todos" ||
            objectMonth === parseInt(this.mesSeleccionado))
        );
      });
      newData = [...filteredData];
    } else {
      newData = this.registroEnfermedadesLote;
    }
    //Luego de filtrado por año y mes se filtra por enfermedad si se ha seleccionado
    if (this.enfermedadSeleccionada != "Todas") {
      let newDataFiltrada = newData.filter(
        (d) => d.nombre_enfermedad === this.enfermedadSeleccionada
      );
      let etapas = this.etapasEnfermedades.filter(
        (d) => d.nombre_enfermedad === this.enfermedadSeleccionada
      );
      let etiquetas = [];
      if (etapas.length != 0) {
        etiquetas = etapas.map((obj) => obj.nombre_etapa);
      } else {
        etiquetas = [this.enfermedadSeleccionada];
      }
      this.createChartFiltrado(newDataFiltrada, etiquetas, etapas.length > 0);
    } else {
      this.createChart(newData);
    }
    this.actualizarContadorErradicaciones();
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
    doc.text(`${this.totalpendientesportratar}`, xCol1 + col1Offset, yLine1 + lineOffset);
    doc.text(`${this.totalentratamiento}`, xCol2 + col2Offset, yLine1 + lineOffset);
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

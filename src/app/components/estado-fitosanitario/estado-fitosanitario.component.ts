import { Component, OnInit } from "@angular/core";
import { LoteService } from "../../Servicios/lote.service";
import { EnfermedadesService } from "src/app/Servicios/enfermedades.service";
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
  enfermedadSeleccionada: string = "Todas";

  totalpalmas: number;
  totalsanas: number;
  totalentratamiento: number;
  totalpendientesportratar: number;
  totalpendientesporerradicar: number;
  totalerradicadas: number;

  casosmes: number;
  casosacumulados: number;
  incidenciareal: number;
  incidenciaacumulada: number;
  
  constructor(
    private _loteService: LoteService,
    private _enfermedadesService: EnfermedadesService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.nombreLoteParams = params.get("lote");
    });
    this._loteService.getLote(this.nombreLoteParams).subscribe(
      (lote: LoteModel) => {
        this.lote = lote;
      },
      (error) => {
        console.error(error);
      }
    );
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
    this._loteService.getEnfermedadesServer().subscribe(
      (aux: EnfermedadNombre[]) => {
        this.enfermedades = aux;
      },
      (error) => {
        console.error(error);
      }
    );

    this._loteService.getEtapasServer().subscribe(
      (aux: EtapaEnfermedad[]) => {
        this.etapasEnfermedades = aux;
      },
      (error) => {
        console.error(error);
      }
    );

    this._enfermedadesService.getEnfermedadesRegistradas().subscribe(
      (data) => {
        // Process the array of data here
        this.registroEnfermedadesLote = data.filter(
          (d) => d.nombre_lote === this.nombreLoteParams
        );
        this.createChart(this.registroEnfermedadesLote);
      },
      (error) => {
        // Handle any errors that occur during the HTTP request
        console.error(error);
      }
    );
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

    const values: any[] = this.enfermedades.reduce(
      (acc: any[], map: { [key: string]: any }) => {
        return acc.concat(Object.values(map));
      },
      []
    );
    const lengths: number[] = [];
    for (const key in this.graficosData) {
      if (this.graficosData.hasOwnProperty(key)) {
        const values: any[] = this.graficosData[key];
        lengths.push(values.length);
      }
    }
    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: values,
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
  }
}

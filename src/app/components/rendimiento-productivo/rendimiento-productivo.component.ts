import { Component, OnInit } from "@angular/core";
import { CensosProductivosService } from "../../Servicios/censos-productivos.service";
import { ActivatedRoute } from "@angular/router";
import { CensoProductivoModel } from "src/app/models/censoProductivo";
import * as Chart from "chart.js";
import { LoteService } from "src/app/Servicios/lote.service";
import { LoteModel } from "src/app/models/lote.models";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-rendimiento-productivo",
  templateUrl: "./rendimiento-productivo.component.html",
  styleUrls: ["./rendimiento-productivo.component.css"],
})
export class RendimientoProductivoComponent implements OnInit {
  censoProductivo: CensoProductivoModel[];
  censosFiltered: CensoProductivoModel[];
  lotes: LoteModel[];
  chart: Chart;
  chartMap: Map<string, number>;
  panelOpenState = false;

  yearSeleccionado: string = "Todos";
  mesSeleccionado: string = "Todos";
  loteSeleccionado: string = "Todos";
  constructor(
    private _censosProductivosService: CensosProductivosService,
    private _loteService: LoteService,
    private activatedRoute: ActivatedRoute,
    public datepipe: DatePipe
  ) {}

  ngOnInit() {
    this._loteService.getLotes().subscribe((lotes: LoteModel[]) => {
      this.lotes = lotes;
    });

    this._censosProductivosService.getCensosProductivos().subscribe(
      (censosProductivo: CensoProductivoModel[]) => {
        this.censoProductivo = censosProductivo;
        this.createChart();
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  createChart() {
    let data = this.censoProductivo;

    if (this.loteSeleccionado != "Todos") {
      data = data.filter((e) => e.nombre_lote == this.loteSeleccionado);
    }
    // data = data.filter( (e) => e.nombre_lote == this.loteSeleccionado);
    //Aqui filtra por año o por mes si se ha seleccionado
    if (this.yearSeleccionado != "Todos" || this.mesSeleccionado != "Todos") {
      const filteredData = data.filter((obj) => {
        const date = new Date(obj.fecha_registro_censo_productivo);
        const objectYear = date.getFullYear();
        const objectMonth = date.getMonth();
        return (
          (this.yearSeleccionado === "Todos" ||
            objectYear === parseInt(this.yearSeleccionado)) &&
          (this.mesSeleccionado === "Todos" ||
            objectMonth === parseInt(this.mesSeleccionado))
        );
      });
      data = [...filteredData];
    }
    this.censosFiltered = data;
    let floresFemeninas = data.reduce(
      (sum, current) => sum + current.cantidad_flores_femeninas,
      0
    );
    let floresMasculinas = data.reduce(
      (sum, current) => sum + current.cantidad_flores_masculinas,
      0
    );
    let racimosVerdes = data.reduce(
      (sum, current) => sum + current.cantidad_racimos_verdes,
      0
    );
    let racimosPintones = data.reduce(
      (sum, current) => sum + current.cantidad_racimos_pintones,
      0
    );
    let racimosSobreMaduros = data.reduce(
      (sum, current) => sum + current.cantidad_racimos_sobremaduros,
      0
    );
    let racimosMaduros = data.reduce(
      (sum, current) => sum + current.cantidad_racimos_maduros,
      0
    );

    const canvas = document.getElementById("myChart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    let chartDataMap = new Map<string, number>();
    chartDataMap.set("Flores Femeninas", floresFemeninas);
    chartDataMap.set("Flores Masculinas", floresMasculinas);
    chartDataMap.set("Racimos Verdes", racimosVerdes);
    chartDataMap.set("Racimos Pintones", racimosPintones);
    chartDataMap.set("Racimos Sobremaduros", racimosSobreMaduros);
    chartDataMap.set("Racimos Maduros", racimosMaduros);
    this.chartMap = chartDataMap;
    let chartLabels = Array.from(chartDataMap.keys());
    let chartValues = Array.from(chartDataMap.values());

    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Censo productivo",
            data: chartValues,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
            ],
            borderColor: [
              "rgb(255, 99, 132)",
              "rgb(255, 159, 64)",
              "rgb(255, 205, 86)",
              "rgb(75, 192, 192)",
              "rgb(54, 162, 235)",
              "rgb(153, 102, 255)",
              "rgb(201, 203, 207)",
            ],
            borderWidth: 1,
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

  formatDateTime(dateTime: Date): string {
    // const year = dateTime.getFullYear();
    // const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
    // const day = dateTime.getDate().toString().padStart(2, "0");

    // return `${year}-${month}-${day}`;
    // const formattedDate = dateTime.getHours().toString();
    console.log(dateTime);
    let latest_date = this.datepipe.transform(dateTime, "yyyy-MM-dd");
    return latest_date;
  }
}

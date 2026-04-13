import { Component, OnInit } from '@angular/core';
import { CensosProductivosService } from '../../Servicios/censos-productivos.service';
import { ActivatedRoute } from '@angular/router';
import { CensoProductivoModel } from 'src/app/models/censoProductivo';
import * as Chart from 'chart.js';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-estado-productivo',
  templateUrl: './estado-productivo.component.html',
  styleUrls: ['./estado-productivo.component.css'],
})
export class EstadoProductivoComponent implements OnInit {
  censoProductivo: CensoProductivoModel[];
  censosFiltered: CensoProductivoModel[];
  chart: Chart;
  chartMap: Map<string, number>;
  panelOpenState = false;
  nombreLoteParams: string;

  yearSeleccionado = 'Todos';
  mesSeleccionado = 'Todos';

  constructor(
    private censosProductivosService: CensosProductivosService,
    private activatedRoute: ActivatedRoute,
    public datepipe: DatePipe
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.nombreLoteParams = params.get('lote');

      this.censosProductivosService
        .getCensosProductivosLote(this.nombreLoteParams)
        .subscribe(
          (censosProductivo: CensoProductivoModel[]) => {
            this.censoProductivo = censosProductivo;
            this.createChart();
          },
          (error: any) => {
            console.error(error);
          }
        );
    });
  }

  createChart() {
    const data = this.filtrarCensosPorPeriodo(this.censoProductivo || []);
    this.censosFiltered = data;
    const chartDataMap = this.calcularTotales(data);

    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    this.chartMap = chartDataMap;
    const chartLabels = Array.from(chartDataMap.keys());
    const chartValues = Array.from(chartDataMap.values());

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Censo productivo',
            data: chartValues,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(201, 203, 207, 0.2)',
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(201, 203, 207)',
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

  private filtrarCensosPorPeriodo(data: CensoProductivoModel[]): CensoProductivoModel[] {
    if (this.yearSeleccionado === 'Todos' && this.mesSeleccionado === 'Todos') {
      return data;
    }

    return data.filter((obj) => {
      const date = new Date(obj.fecha_registro_censo_productivo);
      const objectYear = date.getFullYear();
      const objectMonth = date.getMonth();
      return (
        (this.yearSeleccionado === 'Todos' ||
          objectYear === parseInt(this.yearSeleccionado, 10)) &&
        (this.mesSeleccionado === 'Todos' ||
          objectMonth === parseInt(this.mesSeleccionado, 10))
      );
    });
  }

  private calcularTotales(data: CensoProductivoModel[]): Map<string, number> {
    const sum = (selector: (item: CensoProductivoModel) => number | undefined) => {
      return data.reduce((total, current) => total + (selector(current) ?? 0), 0);
    };

    const chartDataMap = new Map<string, number>();
    chartDataMap.set('Flores Femeninas', sum((item) => item.cantidad_flores_femeninas));
    chartDataMap.set('Flores Masculinas', sum((item) => item.cantidad_flores_masculinas));
    chartDataMap.set('Racimos Verdes', sum((item) => item.cantidad_racimos_verdes));
    chartDataMap.set('Racimos Pintones', sum((item) => item.cantidad_racimos_pintones));
    chartDataMap.set(
      'Racimos Sobremaduros',
      sum((item) => item.cantidad_racimos_sobremaduros)
    );
    chartDataMap.set('Racimos Maduros', sum((item) => item.cantidad_racimos_maduros));
    return chartDataMap;
  }

  formatDateTime(dateTime: Date): string {
    const latestDate = this.datepipe.transform(dateTime, 'yyyy-MM-dd');
    return latestDate;
  }
}

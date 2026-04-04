import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Chart } from "chart.js";
import {
  IncidenciaMensualRow,
  ResumenCard,
} from "./estado-fitosanitario.types";

@Component({
  selector: "app-vista-mensual-fitosanitario",
  templateUrl: "./vista-mensual-fitosanitario.component.html",
  styleUrls: ["./vista-mensual-fitosanitario.component.css"],
})
export class VistaMensualFitosanitarioComponent
  implements AfterViewInit, OnChanges
{
  @Input() cards: ResumenCard[] = [];
  @Input() fechaSeleccionada = "";
  @Input() enfermedadSeleccionada = "Todas";
  @Input() enfermedades: Array<{ nombre: string }> = [];
  @Input() estadoCargaMensaje = "";
  @Input() chartLabels: string[] = [];
  @Input() chartData: number[] = [];
  @Input() incidenciasMensuales: IncidenciaMensualRow[] = [];

  @Output() fechaSeleccionadaChange = new EventEmitter<string>();
  @Output() enfermedadSeleccionadaChange = new EventEmitter<string>();
  @Output() consultar = new EventEmitter<void>();
  @Output() generarPdf = new EventEmitter<void>();

  @ViewChild("monthlyChart") monthlyChartRef: ElementRef<HTMLCanvasElement>;

  private monthlyChart: Chart;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(_: SimpleChanges): void {
    if (this.viewReady) {
      this.renderChart();
    }
  }

  onFechaChange(value: string): void {
    this.fechaSeleccionadaChange.emit(value || "");
  }

  onEnfermedadChange(value: string): void {
    this.enfermedadSeleccionadaChange.emit(value || "Todas");
  }

  onConsultar(): void {
    this.consultar.emit();
  }

  onGenerarPdf(): void {
    this.generarPdf.emit();
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

  private renderChart(): void {
    const canvas = this.monthlyChartRef?.nativeElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx) {
      return;
    }

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    this.monthlyChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: this.chartLabels?.length ? this.chartLabels : ["Sin datos"],
        datasets: [
          {
            label: "# de casos",
            data: this.chartData?.length ? this.chartData : [0],
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
}

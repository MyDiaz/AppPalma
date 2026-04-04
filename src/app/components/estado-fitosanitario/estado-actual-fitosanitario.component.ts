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
import { ActivePalmRow, ResumenCard } from "./estado-fitosanitario.types";

@Component({
  selector: "app-estado-actual-fitosanitario",
  templateUrl: "./estado-actual-fitosanitario.component.html",
  styleUrls: ["./estado-actual-fitosanitario.component.css"],
})
export class EstadoActualFitosanitarioComponent
  implements AfterViewInit, OnChanges
{
  @Input() cards: ResumenCard[] = [];
  @Input() lotes: string[] = [];
  @Input() loteSeleccionado: string = "Todos";
  @Input() activePalms: ActivePalmRow[] = [];
  @Input() totalPalmas = 0;
  @Input() palmasSanas = 0;
  @Input() palmasEnTratamiento = 0;
  @Input() palmasPendientesPorTratar = 0;
  @Input() palmasPendientesPorErradicar = 0;

  @Output() loteSeleccionadoChange = new EventEmitter<string>();

  @ViewChild("overviewChart") overviewChartRef: ElementRef<HTMLCanvasElement>;
  @ViewChild("diseaseChart") diseaseChartRef: ElementRef<HTMLCanvasElement>;

  private overviewChart: Chart;
  private diseaseChart: Chart;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderCharts();
  }

  ngOnChanges(_: SimpleChanges): void {
    if (this.viewReady) {
      this.renderCharts();
    }
  }

  onLoteChange(value: string): void {
    this.loteSeleccionadoChange.emit(value || "Todos");
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

  formatEstadoActivo(estado: ActivePalmRow["estado"]): string {
    const labelMap: { [key in ActivePalmRow["estado"]]: string } = {
      en_tratamiento: "En tratamiento",
      pendiente_por_tratar: "Pendiente por tratar",
      pendiente_por_erradicar: "Pendiente por erradicar",
    };

    return labelMap[estado] ?? estado;
  }

  private renderCharts(): void {
    this.renderOverviewChart();
    this.renderDiseaseChart();
  }

  private renderOverviewChart(): void {
    const canvas = this.overviewChartRef?.nativeElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx) {
      return;
    }

    if (this.overviewChart) {
      this.overviewChart.destroy();
    }

    const palmasEnfermas = Math.max(
      this.totalPalmas - this.palmasSanas,
      this.palmasEnTratamiento +
        this.palmasPendientesPorTratar +
        this.palmasPendientesPorErradicar
    );

    this.overviewChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Palmas sanas", "Palmas enfermas"],
        datasets: [
          {
            data: [this.palmasSanas, palmasEnfermas],
            backgroundColor: ["#6ca870", "#ff9f1c"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        legend: {
          position: "bottom",
        },
        tooltips: {
          enabled: true,
        },
      },
    });
  }

  private renderDiseaseChart(): void {
    const canvas = this.diseaseChartRef?.nativeElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx) {
      return;
    }

    if (this.diseaseChart) {
      this.diseaseChart.destroy();
    }

    this.diseaseChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: [
          "En tratamiento",
          "Pendientes por tratar",
          "Pendientes por erradicar",
        ],
        datasets: [
          {
            data: [
              this.palmasEnTratamiento,
              this.palmasPendientesPorTratar,
              this.palmasPendientesPorErradicar,
            ],
            backgroundColor: ["#ffbf69", "#ff9f1c", "#ff7b00"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        legend: {
          position: "bottom",
        },
        tooltips: {
          enabled: true,
        },
      },
    });
  }
}

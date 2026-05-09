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
import {
  buildCurrentStateCards,
  formatEstadoActivo,
  formatFechaRegistro,
} from "./estado-fitosanitario.helpers";

@Component({
  selector: "app-estado-actual-fitosanitario",
  templateUrl: "./estado-actual-fitosanitario.component.html",
  styleUrls: ["./estado-actual-fitosanitario.component.css"],
})
export class EstadoActualFitosanitarioComponent
  implements AfterViewInit, OnChanges
{
  @Input() lotes: string[] = [];
  @Input() loteSeleccionado: string = "Todos";
  @Input() totalPalmas = 0;
  @Input() activePalms: ActivePalmRow[] = [];

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

  get cards(): ResumenCard[] {
    return buildCurrentStateCards(this.activePalms, this.totalPalmas);
  }

  getCardTooltip(card: ResumenCard): string {
    const scope =
      this.loteSeleccionado && this.loteSeleccionado !== "Todos"
        ? `en ${this.loteSeleccionado}`
        : "en toda la plantacion";

    const messageMap: { [label: string]: string } = {
      "Total de palmas": `Cantidad total de palmas sembradas ${scope}.`,
      "Palmas sanas": `Palmas sin estado fitosanitario activo ${scope}.`,
      "Palmas en tratamiento": `Palmas con tratamiento activo ${scope}.`,
      "Palmas pendientes por tratar": `Palmas que aun no han iniciado tratamiento ${scope}.`,
      "Palmas pendientes por erradicar": `Palmas que deben ser erradicadas ${scope}.`,
    };

    return messageMap[card.label] ?? card.description;
  }

  formatFechaRegistro(value: string): string {
    return formatFechaRegistro(value);
  }

  formatEstadoActivo(estado: ActivePalmRow["estado"]): string {
    return formatEstadoActivo(estado);
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

    const totalPalmas = this.getCardValue("Total de palmas");
    const palmasSanas = this.getCardValue("Palmas sanas");
    const palmasEnTratamiento = this.getCardValue("Palmas en tratamiento");
    const palmasPendientesPorTratar = this.getCardValue(
      "Palmas pendientes por tratar"
    );
    const palmasPendientesPorErradicar = this.getCardValue(
      "Palmas pendientes por erradicar"
    );
    const palmasEnfermas =
      palmasEnTratamiento +
      palmasPendientesPorTratar +
      palmasPendientesPorErradicar;

    this.overviewChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Palmas sanas", "Palmas enfermas"],
        datasets: [
          {
            data: [palmasSanas, Math.max(totalPalmas - palmasSanas, palmasEnfermas)],
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

    const palmasEnTratamiento = this.getCardValue("Palmas en tratamiento");
    const palmasPendientesPorTratar = this.getCardValue(
      "Palmas pendientes por tratar"
    );
    const palmasPendientesPorErradicar = this.getCardValue(
      "Palmas pendientes por erradicar"
    );

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
              palmasEnTratamiento,
              palmasPendientesPorTratar,
              palmasPendientesPorErradicar,
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

  private getCardValue(label: string): number {
    const card = this.cards.find((item) => item.label === label);
    const value = Number(card?.value);
    return Number.isFinite(value) ? value : 0;
  }
}

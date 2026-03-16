import { Component, OnInit } from "@angular/core";
import { CensosProductivosService } from "../../Servicios/censos-productivos.service";
import { CensoProductivoModel } from "src/app/models/censoProductivo";
import { Chart } from 'chart.js';
import { LoteService } from "src/app/Servicios/lote.service";
import { LoteModel } from "src/app/models/lote.models";
import { DatePipe } from "@angular/common";
import { jsPDF } from "jspdf";

@Component({
  selector: "app-rendimiento-productivo",
  templateUrl: "./rendimiento-productivo.component.html",
  styleUrls: ["./rendimiento-productivo.component.css"],
})
export class RendimientoProductivoComponent implements OnInit {
  censoProductivo: CensoProductivoModel[] = [];
  censosFiltered: CensoProductivoModel[] = [];
  lotes: LoteModel[] = [];
  chart: Chart;
  chartMap: Map<string, number> = new Map();
  chartMapKeys: string[] = [];
  dateFilteredChartMap: Map<string, number> = new Map();
  dateFilteredChartKeys: string[] = [];
  panelOpenState = false;

  yearSeleccionado: string = "Todos";
  mesSeleccionado: string = "Todos";
  loteSeleccionado: string = "Todos";
  years: number[] = [];
  constructor(
    private _censosProductivosService: CensosProductivosService,
    private loteService: LoteService,
    public datepipe: DatePipe
  ) {}

  ngOnInit() {
    this.loteService.getLotes().subscribe((lotes: LoteModel[]) => {
      this.lotes = lotes;
    });

    const currentYear = new Date().getFullYear();
    this._censosProductivosService.getCensosProductivosMinYear().subscribe(
      res => {
        for (var i = res.min_year; i <= currentYear; i++) {
          this.years.push(i);
        }
      },
      (error: any) => {
        console.error(error);
        for (var i = 2000; i <= currentYear; i++) {
          this.years.push(i);
        }
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

  private matchesYearMonth(item: CensoProductivoModel): boolean {
    const itemDate = new Date(item.fecha_registro_censo_productivo);
    const matchesYear =
      this.yearSeleccionado === "Todos" ||
      parseInt(this.yearSeleccionado) === itemDate.getFullYear();
    const matchesMonth =
      this.mesSeleccionado === "Todos" ||
      parseInt(this.mesSeleccionado) === itemDate.getMonth();
    return matchesYear && matchesMonth;
  }

  chartFilter = (item: CensoProductivoModel) => {
    const matchesLote =
      this.loteSeleccionado === "Todos" ||
      this.loteSeleccionado === item.nombre_lote;
    return matchesLote && this.matchesYearMonth(item);
  };

  createChart() {
    this.censosFiltered = this.censoProductivo.filter(this.chartFilter);

    const filteredTotals = this.aggregateChartData(this.censosFiltered);
    this.chartMap = filteredTotals;
    this.chartMapKeys = Array.from(filteredTotals.keys());

    const dateFilteredTotals = this.aggregateChartData(
      this.censoProductivo.filter((item) => this.matchesYearMonth(item))
    );
    this.dateFilteredChartMap = dateFilteredTotals;
    this.dateFilteredChartKeys = Array.from(dateFilteredTotals.keys());

    const canvas = document.getElementById("myChart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (this.chart) {
      this.chart.destroy();
    }
    const chartValues = Array.from(filteredTotals.values());

    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: this.chartMapKeys,
        datasets: [
          {
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
        legend: {
          display: false,
        },
        tooltips: {
          enabled: true,
          mode: "nearest",
        },
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

  private aggregateChartData(data: CensoProductivoModel[]): Map<string, number> {
    const sum = (selector: (item: CensoProductivoModel) => number | undefined) =>
      data.reduce((total, current) => total + (selector(current) ?? 0), 0);

    const totals = new Map<string, number>();
    totals.set("Flores Femeninas", sum(item => item.cantidad_flores_femeninas));
    totals.set("Flores Masculinas", sum(item => item.cantidad_flores_masculinas));
    totals.set("Racimos Verdes", sum(item => item.cantidad_racimos_verdes));
    totals.set("Racimos Pintones", sum(item => item.cantidad_racimos_pintones));
    totals.set("Racimos Sobremaduros", sum(item => item.cantidad_racimos_sobremaduros));
    totals.set("Racimos Maduros", sum(item => item.cantidad_racimos_maduros));
    return totals;
  }

  formatDateTime(dateTime: Date): string {
    // const year = dateTime.getFullYear();
    // const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
    // const day = dateTime.getDate().toString().padStart(2, "0");

    // return `${year}-${month}-${day}`;
    // const formattedDate = dateTime.getHours().toString();
    let latest_date = this.datepipe.transform(dateTime, "yyyy-MM-dd");
    return latest_date;
  }

  crearPdf() {
    const doc = new jsPDF({ orientation: "portrait", format: "a4" });

    // Titulo
    doc.setFontSize(36);
    doc.text("Rendimiento productivo", 15, 35);
      doc.setFontSize(24);
    if (this.loteSeleccionado === "Todos") {
      doc.text("Lote: Todos", 15, 52);
    } else {
      doc.text(`Lote: ${this.loteSeleccionado}`, 15, 52);
    }
    const monthLabel =
      this.mesSeleccionado === "Todos"
        ? "Todos"
        : this.getMonthName(parseInt(this.mesSeleccionado));
    const yearLabel =
      this.yearSeleccionado === "Todos" ? "Todos" : this.yearSeleccionado;
    doc.setFontSize(18);
    doc.text(`Mes: ${monthLabel} | Año: ${yearLabel}`, 15, 70);

    // Grafica
    const canvas = document.getElementById("myChart") as HTMLCanvasElement;
    doc.addImage(canvas, 'PNG', 15, 90, 180, 100);

    // Resumen
    let floresFemeninas = 0;
    let floresMasculinas = 0;
    let racimosVerdes = 0;
    let racimosPintones = 0;
    let racimosSobremaduros = 0;
    let racimosMaduros = 0;
    this.censosFiltered.forEach(censoProductivo => {
      floresFemeninas += censoProductivo.cantidad_flores_femeninas || 0;
      floresMasculinas += censoProductivo.cantidad_flores_masculinas || 0;
      racimosVerdes += censoProductivo.cantidad_racimos_verdes || 0;
      racimosPintones += censoProductivo.cantidad_racimos_pintones || 0;
      racimosSobremaduros += censoProductivo.cantidad_racimos_sobremaduros || 0;
      racimosMaduros += censoProductivo.cantidad_racimos_maduros || 0;
    });

    const xCol1Summary = 15;
    const xCol2Summary = 105;
    const yLineSummary = 230;
    const lineOffsetSummary = 10;
    doc.setFontSize(16);
    doc.text(`Flores femeninas: ${floresFemeninas}`, xCol1Summary, yLineSummary);
    doc.text(`Flores masculinas: ${floresMasculinas}`, xCol1Summary, yLineSummary + lineOffsetSummary);
    doc.text(`Racimos verdes: ${racimosVerdes}`, xCol1Summary, yLineSummary + 2 * lineOffsetSummary);
    doc.text(`Racimos pintones: ${racimosPintones}`, xCol2Summary, yLineSummary);
    doc.text(`Racimos sobremaduros: ${racimosSobremaduros}`, xCol2Summary, yLineSummary + lineOffsetSummary);
    doc.text(`Racimos maduros: ${racimosMaduros}`, xCol2Summary, yLineSummary + 2 * lineOffsetSummary);
    
    // Lotes (tabla adaptativa)
    const tableColumns = [
      "Fecha",
      "Lote",
      "Palmas\nleidas",
      "Flores\nfemeninas",
      "Flores\nmasculinas",
      "Racimos\nverdes",
      "Racimos\npintones",
      "Racimos\nsobremaduros",
      "Racimos\nmaduros",
      "Responsable",
    ];

    const formatLoteForTable = (value: string): string => {
      if (value.length <= 16) {
        return value;
      }
      return `${value.slice(0, 16)}\n${value.slice(16)}`;
    };

    const tableRows = this.censosFiltered.map(entry => [
      this.formatDateTime(entry.fecha_registro_censo_productivo),
      formatLoteForTable(entry.nombre_lote || ""),
      `${entry.cantidad_palmas_leidas || 0}`,
      `${entry.cantidad_flores_femeninas || 0}`,
      `${entry.cantidad_flores_masculinas || 0}`,
      `${entry.cantidad_racimos_verdes || 0}`,
      `${entry.cantidad_racimos_pintones || 0}`,
      `${entry.cantidad_racimos_sobremaduros || 0}`,
      `${entry.cantidad_racimos_maduros || 0}`,
      entry.nombre_usuario || "",
    ]);

    const rowsPerPage = 10;
    const tableChunks: string[][][] = [];
    if (tableRows.length === 0) {
      tableChunks.push([]);
    } else {
      for (let i = 0; i < tableRows.length; i += rowsPerPage) {
        tableChunks.push(tableRows.slice(i, i + rowsPerPage));
      }
    }

    const pageMargin = 15;
    const headerHeight = 16;
    const rowHeight = 14;
    const columnBaseWidths = [40, 60, 30, 30, 30, 30, 30, 40, 30, 55];
    const headerLabels = tableColumns.map(header => {
      const lines = header.split("\n");
      return lines.length === 1 ? [header, ""] : lines;
    });

    const drawTablePage = (rows: string[][]) => {
      doc.addPage("a4", "landscape");
      const pageWidth = doc.internal.pageSize.getWidth();
      const availableWidth = pageWidth - pageMargin * 2;
      const headerY = pageMargin + 20;
      const totalBaseWidth = columnBaseWidths.reduce((sum, width) => sum + width, 0);
      const scale = availableWidth / totalBaseWidth;
      const columnWidths = columnBaseWidths.map(width => width * scale);

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Historial de censos productivos", pageMargin, pageMargin + 12);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      let currentX = pageMargin;
      headerLabels.forEach((labelLines, columnIndex) => {
        const columnWidth = columnWidths[columnIndex];
        doc.setFillColor(230, 230, 230);
        doc.setDrawColor(0, 0, 0);
        doc.rect(currentX, headerY, columnWidth, headerHeight, "FD");
        doc.setTextColor(0, 0, 0);
        const headerCenterX = currentX + columnWidth / 2;
        const firstLineY = headerY + 6;
        doc.text(labelLines[0], headerCenterX, firstLineY, { align: "center" });
        doc.text(labelLines[1], headerCenterX, firstLineY + 6, { align: "center" });
        currentX += columnWidth;
      });

      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      let currentY = headerY + headerHeight;
      if (rows.length === 0) {
        doc.text(
          "No hay censos productivos para los filtros actuales.",
          pageMargin,
          currentY + rowHeight
        );
        return;
      }

      rows.forEach(row => {
        let columnX = pageMargin;
        row.forEach((cell, columnIndex) => {
          const columnWidth = columnWidths[columnIndex];
          doc.setDrawColor(0, 0, 0);
          doc.rect(columnX, currentY, columnWidth, rowHeight, "S");
          if (cell.includes("\n")) {
            const [firstLine, secondLine] = cell.split("\n");
            doc.text(firstLine, columnX + 3, currentY + 5);
            doc.text(secondLine, columnX + 3, currentY + 10);
          } else {
            doc.text(cell, columnX + 3, currentY + rowHeight / 2, {
              baseline: "middle",
            });
          }
          columnX += columnWidth;
        });
        currentY += rowHeight;
      });
    };

    tableChunks.forEach(chunk => drawTablePage(chunk));

    doc.save(`Rendimiento_Productivo.pdf`);
  }

  private getMonthName(monthIndex: number): string {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[monthIndex] ?? "Mes desconocido";
  }
}

import { Injectable } from "@angular/core";
import { jsPDF } from "jspdf";
import {
  ActivePalmRow,
  IncidenciaMensualRow,
  ResumenCard,
} from "./estado-fitosanitario.types";

export interface EstadoFitosanitarioPdfData {
  nombreLoteParams: string;
  fechaSeleccionada?: string;
  enfermedadSeleccionada?: string;
  chartCanvas?: HTMLCanvasElement | null;
  overviewChartCanvas?: HTMLCanvasElement | null;
  diseaseChartCanvas?: HTMLCanvasElement | null;
  monthlyChartCanvas?: HTMLCanvasElement | null;
  currentCards?: ResumenCard[];
  monthlyMainCards?: ResumenCard[];
  monthlyEvolutionCards?: ResumenCard[];
  activePalms?: ActivePalmRow[];
  incidenciasMensuales?: IncidenciaMensualRow[];
}

@Injectable({
  providedIn: "root",
})
export class EstadoFitosanitarioPdfService {
  private readonly pageWidth = 210;
  private readonly pageHeight = 297;
  private readonly margin = 12;
  private readonly dark = "#173f3a";
  private readonly muted = "#65756f";
  private readonly border = "#dbe9e4";
  private readonly headerFill = "#e5f0eb";

  generarPdf(
    data: EstadoFitosanitarioPdfData,
    doc: jsPDF = new jsPDF({ orientation: "portrait", format: "a4" })
  ): void {
    this.paintPageBackground(doc);
    this.drawReportTitle(doc, "Estado fitosanitario", data, 20);

    let y = 42;
    this.drawSectionTitle(doc, "Estado actual", y);
    y += 10;
    y = this.drawMetricGrid(doc, data.currentCards || [], y, 3);
    y += 8;
    y = this.drawTopCharts(doc, data, y);
    y += 10;
    this.drawSectionTitle(doc, "Palmas activas", y);
    this.drawActivePalmsTable(doc, data.activePalms || [], y + 7);
    this.drawFooter(doc);

    doc.addPage();
    this.paintPageBackground(doc);

    y = 20;
    this.drawReportTitle(doc, "Vista mensual", data, y);
    y += 22;
    this.drawFiltersInline(doc, data, y);
    y += 12;
    y = this.drawMetricGrid(doc, data.monthlyMainCards || [], y, 4);
    y += 8;
    this.drawSectionTitle(doc, "Evolucion", y);
    y = this.drawMetricGrid(doc, data.monthlyEvolutionCards || [], y + 8, 3);
    y += 8;
    this.drawSectionTitle(doc, "Detalle por enfermedad", y);
    if (data.monthlyChartCanvas || data.chartCanvas) {
      this.drawCanvasFit(doc, data.monthlyChartCanvas || data.chartCanvas, 18, y + 8, 174, 62);
    } else {
      this.drawEmptyText(doc, "No hay grafico disponible.", 18, y + 36);
    }
    y += 78;
    this.drawMonthlyIncidences(doc, data.incidenciasMensuales || [], y);
    this.drawFooter(doc);
    doc.save(`Estado_Fitosanitario-${data.nombreLoteParams}.pdf`);
  }

  private paintPageBackground(doc: jsPDF): void {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, this.pageWidth, this.pageHeight, "F");
  }

  private drawReportTitle(
    doc: jsPDF,
    title: string,
    data: EstadoFitosanitarioPdfData,
    y: number
  ): void {
    doc.setTextColor(this.dark);
    doc.setFont(undefined, "bold");
    doc.setFontSize(17);
    doc.text(title, this.margin, y);
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.setTextColor(this.muted);
    doc.text(`Lote: ${data.nombreLoteParams || "Todos"}`, this.margin, y + 8);
    doc.text(this.formatDateLong(new Date()), this.pageWidth - this.margin, y + 8, {
      align: "right",
    });
    doc.setDrawColor(226, 234, 230);
    doc.line(this.margin, y + 13, this.pageWidth - this.margin, y + 13);
  }

  private drawSectionTitle(doc: jsPDF, title: string, y: number): void {
    doc.setTextColor(this.dark);
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text(title, this.margin, y);
  }

  private drawMetricGrid(
    doc: jsPDF,
    cards: ResumenCard[],
    y: number,
    columns: number
  ): number {
    const columnWidth = (this.pageWidth - this.margin * 2) / columns;
    const rowHeight = 16;

    cards.forEach((card, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = this.margin + col * columnWidth;
      const currentY = y + row * rowHeight;
      doc.setTextColor(this.muted);
      doc.setFont(undefined, "bold");
      doc.setFontSize(7);
      const label = doc.splitTextToSize(String(card.label), columnWidth - 6).slice(0, 2);
      doc.text(label, x, currentY);
      doc.setTextColor(this.dark);
      doc.setFontSize(13);
      doc.text(String(card.value), x, currentY + 9);
    });

    return y + Math.ceil(cards.length / columns) * rowHeight;
  }

  private drawTopCharts(doc: jsPDF, data: EstadoFitosanitarioPdfData, y: number): number {
    doc.setTextColor(this.dark);
    doc.setFont(undefined, "bold");
    doc.setFontSize(8);
    doc.text("Sanas vs. enfermas", 55, y + 4, { align: "center" });
    doc.text("Palmas enfermas", 155, y + 4, { align: "center" });

    if (data.overviewChartCanvas) {
      this.drawCanvasFit(doc, data.overviewChartCanvas, 20, y + 8, 70, 52);
    }
    if (data.diseaseChartCanvas) {
      this.drawCanvasFit(doc, data.diseaseChartCanvas, 120, y + 8, 70, 52);
    }
    return y + 62;
  }

  private drawCanvasFit(
    doc: jsPDF,
    canvas: HTMLCanvasElement | null | undefined,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number
  ): void {
    if (!canvas) {
      return;
    }

    const sourceWidth = canvas.width || maxWidth;
    const sourceHeight = canvas.height || maxHeight;
    const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
    const width = sourceWidth * scale;
    const height = sourceHeight * scale;
    const centeredX = x + (maxWidth - width) / 2;
    const centeredY = y + (maxHeight - height) / 2;

    doc.addImage(canvas, "PNG", centeredX, centeredY, width, height);
  }

  private drawActivePalmsTable(
    doc: jsPDF,
    rows: ActivePalmRow[],
    y: number
  ): void {
    const body = rows.map((row) => [
      row.nombre_lote,
      String(row.id_palma),
      row.nombre_enfermedad,
      row.etapa_enfermedad || "-",
      this.formatDate(row.fecha),
      this.formatActiveState(row.estado),
    ]);
    this.drawTable(
      doc,
      ["Lote", "ID palma", "Enfermedad", "Estado enfermedad", "Fecha", "Estado"],
      body,
      y,
      [22, 16, 44, 34, 22, 38],
      "Palmas activas"
    );
  }

  private drawMonthlyIncidences(
    doc: jsPDF,
    incidencias: IncidenciaMensualRow[],
    y: number
  ): void {
    const rows = incidencias.map((row) => [
      row.nombre_lote,
      String(row.id_palma),
      row.nombre_enfermedad,
      row.etapa_enfermedad,
      row.estado || "-",
      this.formatDate(row.fecha_registro_enfermedad),
    ]);

    if (y > 238) {
      this.drawFooter(doc);
      doc.addPage();
      this.paintPageBackground(doc);
      y = 18;
    }

    doc.setTextColor(this.dark);
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text("Incidencias de enfermedades", this.margin, y);
    this.drawTable(
      doc,
      ["Lote", "ID palma", "Enfermedad", "Etapa enfermedad", "Estado", "Fecha de registro"],
      rows,
      y + 7,
      [25, 16, 42, 36, 24, 33],
      "Incidencias de enfermedades"
    );
  }

  private drawTable(
    doc: jsPDF,
    headers: string[],
    rows: string[][],
    y: number,
    widths: number[],
    continuationTitle: string
  ): void {
    const x = this.margin + 2;
    const rowHeight = 6;
    const bottomY = this.pageHeight - 18;
    const tableWidth = widths.reduce((sum, width) => sum + width, 0);
    let cursorX = x;
    let cursorY = y;

    const drawHeader = () => {
      cursorX = x;
      doc.setFillColor(this.headerFill);
      doc.rect(x, cursorY, tableWidth, rowHeight, "F");
      doc.setTextColor(this.dark);
      doc.setFont(undefined, "bold");
      doc.setFontSize(7);
      headers.forEach((header, index) => {
        doc.text(header, cursorX + 1, cursorY + 4);
        cursorX += widths[index];
      });
      cursorY += rowHeight;
    };

    drawHeader();

    if (rows.length === 0) {
      this.drawEmptyText(doc, "No hay registros para los filtros actuales.", x, cursorY + 7);
      return;
    }

    doc.setFont(undefined, "normal");
    rows.forEach((row) => {
      if (cursorY + rowHeight > bottomY) {
        this.drawFooter(doc);
        doc.addPage();
        this.paintPageBackground(doc);
        this.drawSectionTitle(doc, `${continuationTitle} (continuacion)`, 18);
        cursorY = 25;
        drawHeader();
        doc.setFont(undefined, "normal");
      }

      cursorX = x;
      doc.setDrawColor(232, 238, 235);
      doc.line(x, cursorY + rowHeight, x + tableWidth, cursorY + rowHeight);
      row.forEach((cell, index) => {
        const text = doc.splitTextToSize(String(cell || "-"), widths[index] - 2)[0] || "-";
        doc.text(text, cursorX + 1, cursorY + 4);
        cursorX += widths[index];
      });
      cursorY += rowHeight;
    });
  }

  private drawFiltersInline(doc: jsPDF, data: EstadoFitosanitarioPdfData, y: number): void {
    doc.setTextColor(this.muted);
    doc.setFont(undefined, "bold");
    doc.setFontSize(8);
    doc.text("Mes:", this.margin, y);
    doc.text("Enfermedad:", 68, y);
    doc.setTextColor(this.dark);
    doc.setFont(undefined, "normal");
    doc.text(this.formatMonth(data.fechaSeleccionada), this.margin + 10, y);
    doc.text(data.enfermedadSeleccionada || "Todas", 88, y);
  }

  private drawEmptyText(doc: jsPDF, text: string, x: number, y: number): void {
    doc.setTextColor(this.muted);
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.text(text, x, y);
  }

  private drawFooter(doc: jsPDF): void {
    doc.setTextColor(this.dark);
    doc.setFontSize(8);
    doc.text("(c) 2026 SIGPA - Todos los derechos reservados", this.pageWidth / 2, this.pageHeight - 5, {
      align: "center",
    });
  }

  private formatActiveState(value: ActivePalmRow["estado"]): string {
    const labels = {
      en_tratamiento: "En tratamiento",
      pendiente_por_tratar: "Pendiente por tratar",
      pendiente_por_erradicar: "Pendiente por erradicar",
    };
    return labels[value] || value;
  }

  private formatDate(value: string): string {
    if (!value) {
      return "-";
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-CO");
  }

  private formatDateLong(date: Date): string {
    return date.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  private formatMonth(value?: string): string {
    const safeValue = value || this.getCurrentMonthValue();
    const match = safeValue.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      return safeValue;
    }
    const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    return date.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  }

  private getCurrentMonthValue(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, "0");
    return `${today.getFullYear()}-${month}`;
  }
}

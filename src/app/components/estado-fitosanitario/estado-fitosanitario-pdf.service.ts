import { Injectable } from "@angular/core";
import { jsPDF } from "jspdf";

export interface EstadoFitosanitarioPdfData {
  nombreLoteParams: string;
  totalpalmas: number;
  totalsanas: number;
  pendientesPorTratar: number;
  registrosEnTratamiento: number;
  totalpendientesporerradicar: number;
  totalerradicadas: number;
  registroEnfermedadesLoteLength: number;
  incidenciareal: number;
  casosacumulados: number;
  incidenciaacumulada: number;
  chartCanvas?: HTMLCanvasElement | null;
}

@Injectable({
  providedIn: "root",
})
export class EstadoFitosanitarioPdfService {
  generarPdf(data: EstadoFitosanitarioPdfData, doc: jsPDF = new jsPDF()): void {

    const xCol1 = 15;
    let xCol2 = 115;
    const yLine1 = 85;
    const lineOffset = 20;
    let col1Offset = 60;
    let col2Offset = 40;

    doc.setFontSize(36);
    doc.text("Estado Fitosanitario", 45, 35);
    doc.setFontSize(24);
    doc.text(`Lote: ${data.nombreLoteParams}`, 20, 60);

    doc.setFontSize(14);
    doc.text("Total de palmas:", xCol1, yLine1);
    doc.text("Sanas:", xCol2, yLine1);
    doc.text("Pendientes por tratar:", xCol1, yLine1 + lineOffset);
    doc.text("En tratamiento:", xCol2, yLine1 + lineOffset);
    doc.text("Pendiente por erradicar:", xCol1, yLine1 + 2 * lineOffset);
    doc.text("Erradicadas:", xCol2, yLine1 + 2 * lineOffset);
    doc.setFontSize(11);
    doc.text(`${data.totalpalmas}`, xCol1 + col1Offset, yLine1);
    doc.text(`${data.totalsanas}`, xCol2 + col2Offset, yLine1);
    doc.text(
      `${data.pendientesPorTratar}`,
      xCol1 + col1Offset,
      yLine1 + lineOffset
    );
    doc.text(
      `${data.registrosEnTratamiento}`,
      xCol2 + col2Offset,
      yLine1 + lineOffset
    );
    doc.text(
      `${data.totalpendientesporerradicar}`,
      xCol1 + col1Offset,
      yLine1 + 2 * lineOffset
    );
    doc.text(
      `${data.totalerradicadas}`,
      xCol2 + col2Offset,
      yLine1 + 2 * lineOffset
    );

    if (data.chartCanvas) {
      doc.addImage(data.chartCanvas, "PNG", 15, 160, 180, 100);
    }

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
    doc.text(
      `${data.registroEnfermedadesLoteLength}`,
      xCol1 + col1Offset,
      yLine4
    );
    doc.text(`${data.incidenciareal}`, xCol2 + col2Offset, yLine4);
    doc.text(`${data.casosacumulados}`, xCol1 + col1Offset, yLine4 + lineOffset);
    doc.text(`${data.incidenciaacumulada}`, xCol2 + col2Offset, yLine4 + lineOffset);

    doc.save(`Estado_Fitosanitario-${data.nombreLoteParams}.pdf`);
  }
}

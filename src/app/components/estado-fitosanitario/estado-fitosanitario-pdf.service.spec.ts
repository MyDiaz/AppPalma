import { TestBed } from "@angular/core/testing";
import { EstadoFitosanitarioPdfService } from "./estado-fitosanitario-pdf.service";

describe("EstadoFitosanitarioPdfService", () => {
  let service: EstadoFitosanitarioPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EstadoFitosanitarioPdfService],
    });
    service = TestBed.inject(EstadoFitosanitarioPdfService);
  });

  it("should generate and save the pdf", () => {
    const doc = {
      setFontSize: jasmine.createSpy("setFontSize"),
      text: jasmine.createSpy("text"),
      addImage: jasmine.createSpy("addImage"),
      addPage: jasmine.createSpy("addPage"),
      save: jasmine.createSpy("save"),
    } as any;
    const canvas = {} as HTMLCanvasElement;

    service.generarPdf({
      nombreLoteParams: "Lote 1",
      totalpalmas: 10,
      totalsanas: 7,
      pendientesPorTratar: 2,
      registrosEnTratamiento: 1,
      totalpendientesporerradicar: 0,
      totalerradicadas: 0,
      registroEnfermedadesLoteLength: 3,
      incidenciareal: 30,
      casosacumulados: 4,
      incidenciaacumulada: 40,
      chartCanvas: canvas,
    }, doc);

    expect(doc.text).toHaveBeenCalledWith("Estado Fitosanitario", 45, 35);
    expect(doc.addImage).toHaveBeenCalledWith(canvas, "PNG", 15, 160, 180, 100);
    expect(doc.save).toHaveBeenCalledWith("Estado_Fitosanitario-Lote 1.pdf");
  });
});

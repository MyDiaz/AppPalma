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
      setFont: jasmine.createSpy("setFont"),
      setTextColor: jasmine.createSpy("setTextColor"),
      setFillColor: jasmine.createSpy("setFillColor"),
      setDrawColor: jasmine.createSpy("setDrawColor"),
      text: jasmine.createSpy("text"),
      rect: jasmine.createSpy("rect"),
      roundedRect: jasmine.createSpy("roundedRect"),
      line: jasmine.createSpy("line"),
      addImage: jasmine.createSpy("addImage"),
      addPage: jasmine.createSpy("addPage"),
      save: jasmine.createSpy("save"),
      splitTextToSize: jasmine
        .createSpy("splitTextToSize")
        .and.callFake((text: string) => [text]),
    } as any;
    const canvas = {} as HTMLCanvasElement;

    service.generarPdf({
      nombreLoteParams: "Lote 1",
      chartCanvas: canvas,
      monthlyChartCanvas: canvas,
    }, doc);

    expect(doc.text).toHaveBeenCalledWith("Estado fitosanitario", 12, 20);
    expect(doc.text).toHaveBeenCalledWith("Vista mensual", 12, 20);
    expect(doc.addImage).toHaveBeenCalledWith(
      canvas,
      "PNG",
      jasmine.any(Number),
      jasmine.any(Number),
      jasmine.any(Number),
      jasmine.any(Number)
    );
    expect(doc.save).toHaveBeenCalledWith("Estado_Fitosanitario-Lote 1.pdf");
  });
});

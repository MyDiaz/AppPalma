import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { AgroquimicosService } from "src/app/Servicios/agroquimicos.service";
import { EnfermedadesService } from "src/app/Servicios/enfermedades.service";
import { ErradicacionesService } from "src/app/Servicios/erradicaciones.service";
import { createActivatedRouteMock } from "src/testing/spec-helpers";
import { EstadoFitosanitarioComponent } from "./estado-fitosanitario.component";

@Component({
  selector: "app-estado-actual-fitosanitario",
  template: "",
})
class EstadoActualStubComponent {
  @Input() lotes: string[] = [];
  @Input() loteSeleccionado = "Todos";
  @Input() totalPalmas = 0;
  @Input() activePalms: unknown[] = [];
  @Output() loteSeleccionadoChange = new EventEmitter<string>();
}

@Component({
  selector: "app-vista-mensual-fitosanitario",
  template: "",
})
class VistaMensualStubComponent {
  @Input() mainCards: unknown[] = [];
  @Input() evolutionCards: unknown[] = [];
  @Input() fechaSeleccionada = "";
  @Input() enfermedadSeleccionada = "Todas";
  @Input() enfermedades: Array<{ nombre: string }> = [];
  @Input() estadoCargaMensaje = "";
  @Input() chartLabels: string[] = [];
  @Input() chartData: number[] = [];
  @Input() incidenciasMensuales: unknown[] = [];
  @Output() fechaSeleccionadaChange = new EventEmitter<string>();
  @Output() enfermedadSeleccionadaChange = new EventEmitter<string>();
  @Output() consultar = new EventEmitter<void>();
  @Output() generarPdf = new EventEmitter<void>();
}

describe("EstadoFitosanitarioComponent", () => {
  let component: EstadoFitosanitarioComponent;
  let fixture: ComponentFixture<EstadoFitosanitarioComponent>;

  const enfermedadesRegistradas = [
    {
      nombre_lote: "Lote 1",
      fecha_registro_enfermedad: "2026-01-01T00:00:00",
      nombre_enfermedad: "Rayo",
      etapa_enfermedad: "Inicial",
      dada_de_alta: false,
      id_palma: 1,
    },
    {
      nombre_lote: "Lote 1",
      fecha_registro_enfermedad: "2026-01-15T00:00:00",
      nombre_enfermedad: "Rayo",
      etapa_enfermedad: "Avanzado",
      dada_de_alta: true,
      id_palma: 2,
    },
    {
      nombre_lote: "Lote 2",
      fecha_registro_enfermedad: "2026-02-01T00:00:00",
      nombre_enfermedad: "Pudricion Cogollo - PC",
      etapa_enfermedad: "Grado 1",
      dada_de_alta: false,
      id_palma: 3,
    },
  ];

  const estadoActual = {
    total_palms_by_lote: [
      { nombre_lote: "Lote 1", total_palmas: 10 },
      { nombre_lote: "Lote 2", total_palmas: 5 },
    ],
    active_palms: [
      {
        nombre_lote: "Lote 1",
        id_palma: 1,
        nombre_enfermedad: "Rayo",
        etapa_enfermedad: "Inicial",
        fecha: "2026-01-01",
        estado: "en_tratamiento",
      },
      {
        nombre_lote: "Lote 1",
        id_palma: 2,
        nombre_enfermedad: "Rayo",
        etapa_enfermedad: "Avanzado",
        fecha: "2026-01-02",
        estado: "pendiente_por_tratar",
      },
      {
        nombre_lote: "Lote 2",
        id_palma: 3,
        nombre_enfermedad: "Pudricion Cogollo - PC",
        etapa_enfermedad: "Grado 1",
        fecha: "2026-02-01",
        estado: "pendiente_por_erradicar",
      },
    ],
  };

  const erradicaciones = [
    { nombre_lote: "Lote 1", fecha_erradicacion: "2026-01-10T00:00:00Z" },
    { nombre_lote: "Lote 2", fecha_erradicacion: "2026-02-10T00:00:00Z" },
  ];

  const agroquimicos = [
    {
      nombre_lote: "Lote 1",
      fecha_registro_tratamiento: "2026-01-05T00:00:00Z",
      id_palma: 1,
      nombre_enfermedad: "Rayo",
    },
    {
      nombre_lote: "Lote 1",
      fecha_registro_tratamiento: "2026-01-06T00:00:00Z",
      id_palma: 2,
      nombre_enfermedad: "Rayo",
    },
  ];

  const informeMensual = {
    total_casos_mes: 2,
    total_casos_acumulados: 3,
    incidencia_real: 20,
    incidencia_acumulada: 30,
    evolucion: {
      pendientes_por_tratar: 1,
      en_recuperacion: 1,
      pendientes_por_erradicar: 2,
      reincidencia: 0,
      de_alta: 1,
      eliminada: 1,
    },
    registros: [
      {
        nombre_lote: "Lote 1",
        fecha_registro_enfermedad: "2026-01-01T00:00:00",
        nombre_enfermedad: "Rayo",
        etapa_enfermedad: "Inicial",
        id_palma: 1,
      },
      {
        nombre_lote: "Lote 1",
        fecha_registro_enfermedad: "2026-01-15T00:00:00",
        nombre_enfermedad: "Rayo",
        etapa_enfermedad: "Avanzado",
        id_palma: 2,
      },
    ],
  };

  let enfermedadesServiceMock: {
    getEnfermedadesRegistradas: jasmine.Spy;
    getEnfermedades: jasmine.Spy;
    getEstadoFitosanitarioActual: jasmine.Spy;
    getInformeMensualFitosanitario: jasmine.Spy;
  };

  beforeEach(async () => {
    enfermedadesServiceMock = {
      getEnfermedadesRegistradas: jasmine
        .createSpy("getEnfermedadesRegistradas")
        .and.returnValue(of(enfermedadesRegistradas)),
      getEnfermedades: jasmine
        .createSpy("getEnfermedades")
        .and.returnValue(
          of([
            { nombre_enfermedad: "Rayo" },
            { nombre_enfermedad: "Pudricion Cogollo - PC" },
          ])
        ),
      getEstadoFitosanitarioActual: jasmine
        .createSpy("getEstadoFitosanitarioActual")
        .and.returnValue(of(estadoActual)),
      getInformeMensualFitosanitario: jasmine
        .createSpy("getInformeMensualFitosanitario")
        .and.returnValue(of(informeMensual)),
    };

    await TestBed.configureTestingModule({
      declarations: [
        EstadoFitosanitarioComponent,
        EstadoActualStubComponent,
        VistaMensualStubComponent,
      ],
      providers: [
        {
          provide: EnfermedadesService,
          useValue: enfermedadesServiceMock,
        },
        {
          provide: ErradicacionesService,
          useValue: {
            getErradicaciones: () => of(erradicaciones),
          },
        },
        {
          provide: AgroquimicosService,
          useValue: {
            getRegistroAgroquimico: () => of(agroquimicos),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteMock({ queryParams: { lote: "Lote 1" } }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoFitosanitarioComponent);
    component = fixture.componentInstance;
  });

  it("should create and apply the lote filter from the route", () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.loteErradicacionesSeleccionado).toBe("Lote 1");
    expect(component.nombreLoteParams).toBe("Lote 1");
    expect(component.totalpalmas).toBe(10);
    expect(enfermedadesServiceMock.getEnfermedadesRegistradas).not.toHaveBeenCalled();
  });

  it("should pass the current state to the child report components", () => {
    fixture.detectChanges();

    const estadoActualStub = fixture.debugElement
      .query(By.directive(EstadoActualStubComponent))
      .componentInstance as EstadoActualStubComponent;
    const mensualStub = fixture.debugElement
      .query(By.directive(VistaMensualStubComponent))
      .componentInstance as VistaMensualStubComponent;

    expect(estadoActualStub.loteSeleccionado).toBe("Lote 1");
    expect(estadoActualStub.lotes).toEqual(["Lote 1", "Lote 2"]);
    expect(estadoActualStub.totalPalmas).toBe(10);
    expect(estadoActualStub.activePalms.length).toBe(2);
    expect(mensualStub.estadoCargaMensaje).toBe("");
    expect(mensualStub.mainCards.length).toBe(4);
    expect(mensualStub.evolutionCards.length).toBe(6);
    expect(mensualStub.chartLabels.length).toBeGreaterThan(0);
    expect(mensualStub.incidenciasMensuales.length).toBe(2);
  });

  it("should request the monthly report with lote, mes and enfermedad filters", () => {
    fixture.detectChanges();
    const mensualStub = fixture.debugElement
      .query(By.directive(VistaMensualStubComponent))
      .componentInstance as VistaMensualStubComponent;

    mensualStub.fechaSeleccionadaChange.emit("2026-01");
    mensualStub.enfermedadSeleccionadaChange.emit("Rayo");
    mensualStub.consultar.emit();
    fixture.detectChanges();

    expect(
      enfermedadesServiceMock.getInformeMensualFitosanitario
    ).toHaveBeenCalledWith({
      mes: "2026-01",
      lote: "Lote 1",
      enfermedad: "Rayo",
    });
  });

  it("should react to child events and forward actions", () => {
    fixture.detectChanges();
    const estadoActualStub = fixture.debugElement
      .query(By.directive(EstadoActualStubComponent))
      .componentInstance as EstadoActualStubComponent;
    const mensualStub = fixture.debugElement
      .query(By.directive(VistaMensualStubComponent))
      .componentInstance as VistaMensualStubComponent;

    const chartSpy = spyOn(component, "cambiarChart").and.callThrough();
    const pdfSpy = spyOn(component, "crearPdf").and.stub();

    estadoActualStub.loteSeleccionadoChange.emit("Lote 2");
    mensualStub.consultar.emit();
    mensualStub.generarPdf.emit();
    fixture.detectChanges();

    expect(component.loteErradicacionesSeleccionado).toBe("Lote 2");
    expect(component.totalpalmas).toBe(5);
    expect(chartSpy).toHaveBeenCalled();
    expect(pdfSpy).toHaveBeenCalled();
  });
});

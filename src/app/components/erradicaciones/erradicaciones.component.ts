import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { ErradicacionesService } from "../../Servicios/erradicaciones.service";
import { LoteService } from "../../Servicios/lote.service";

const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro",
};

@Component({
  selector: "app-erradicaciones",
  templateUrl: "./erradicaciones.component.html",
  styleUrls: ["./erradicaciones.component.css"],
})
export class ErradicacionesComponent implements OnInit {
  erradicaciones: any[] = [];
  estadoErradicaciones: MatTableDataSource<any>;
  detalleErradicaciones: MatTableDataSource<any>;
  procesoErradicaciones: FormGroup;

  cargando = false;
  bandera_error = false;
  mensaje_error = "";
  filtradas = estadosBusqueda.inicio;
  mostrarPaginador = true;
  mostrarPaginadorDetalle = false;
  mostrarTablaDetalle = false;
  filterApplied = false;
  private pendingRequests = 0;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  columnsErradicaciones = [
    { columnDef: "id_palma", header: "ID Palma" },
    { columnDef: "fecha_presentacion", header: "Fecha de erradicación" },
    { columnDef: "causa_erradicacion", header: "Causa" },
  ];


  lotes: any[] = [];

  constructor(
    private _loteService: LoteService,
    private _erradicacionesService: ErradicacionesService,
    private datePipe: DatePipe
  ) {
    this.procesoErradicaciones = new FormGroup({
      activas: new FormControl(false),
      finalizadas: new FormControl(false),
      nombreLote: new FormControl("TODOS"),
    });

    this.procesoErradicaciones.get("nombreLote").valueChanges.subscribe(() => {
      this.filtroEstadoErradicaciones();
    });

    this.estadoErradicaciones = new MatTableDataSource<any>([]);
    this.detalleErradicaciones = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.loadLotes();
    this.loadErradicaciones();
  }

  private loadLotes(): void {
    this.startRequest();
    this._loteService.getLotes().subscribe(
      (data) => {
        this.lotes = data ?? [];
        if (!this.lotes.find((lote) => lote.nombre_lote === "TODOS")) {
          this.lotes.push({ nombre_lote: "TODOS" });
        }
        this.finishRequest();
      },
      (error) => {
        this.handleError(error);
        this.finishRequest();
      }
    );
  }

  private loadErradicaciones(): void {
    this.startRequest();
    this._erradicacionesService.getErradicaciones().subscribe(
      (data) => {
        this.erradicaciones = (data ?? []).map((item) => ({
          ...item,
          fecha_presentacion:
            this.datePipe.transform(item.fecha_erradicacion, "d 'de' MMMM 'de' y") ||
            item.fecha_erradicacion,
        }));
        this.filtroEstadoErradicaciones();
        this.finishRequest();
      },
      (error) => {
        this.handleError(error);
        this.finishRequest();
      }
    );
  }

  private startRequest(): void {
    this.pendingRequests++;
    this.cargando = true;
  }

  private finishRequest(): void {
    this.pendingRequests--;
    if (this.pendingRequests <= 0) {
      this.pendingRequests = 0;
      this.cargando = false;
    }
  }

  private handleError(error: any): void {
    this.bandera_error = true;
    this.mensaje_error = error?.error?.message ?? "Servicio no disponible";
  }

  filtroEstadoErradicaciones() {
    const startValue = this.range.get("start").value;
    const endValue = this.range.get("end").value;
    const startDate = startValue ? new Date(startValue) : null;
    const endDate = endValue ? new Date(endValue) : null;
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    const loteSeleccionado = this.procesoErradicaciones.get("nombreLote").value;
    if (!this.filterApplied && (startValue || endValue || (loteSeleccionado && loteSeleccionado !== "TODOS"))) {
      this.filterApplied = true;
    }

    const filtered = this.erradicaciones.filter((item) => {
      const fecha = item.fecha_erradicacion ? new Date(item.fecha_erradicacion) : null;
      const matchesStart = !startDate || (fecha ? fecha >= startDate : false);
      const matchesEnd = !endDate || (fecha ? fecha <= endDate : false);
      const matchesLote =
        !loteSeleccionado ||
        loteSeleccionado === "TODOS" ||
        item.nombre_lote === loteSeleccionado;

      return matchesStart && matchesEnd && matchesLote;
    });

    this.estadoErradicaciones.data = filtered;
    this.filtradas = filtered.length ? estadosBusqueda.encontro : estadosBusqueda.noEncontro;
  }

  submit() {
    this.filtroEstadoErradicaciones();
  }
}

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
} from "@angular/core";
import { CensosService } from "../../Servicios/censos.service";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  FormArray,
} from "@angular/forms";
import * as moment from "moment";
import { MatTableDataSource } from "@angular/material/table";
import { LoteService } from "../../Servicios/lote.service";
import { ActivatedRoute } from "@angular/router";
import { element } from "protractor";

const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro",
};

@Component({
  selector: "app-censos",
  templateUrl: "./censos.component.html",
  styleUrls: ["./censos.component.css"],
})
export class CensosComponent implements OnInit {
  @ViewChild("mat-column-presencia_sector") myCellRef: ElementRef;

  censos: any = []; //listado de Censos traidos desde la base de datos
  estadoCensos: MatTableDataSource<any>; //objeto que será llenado luego de realizar el filtro
  //detalleCensos:MatTableDataSource<any>; //listado del detalle de la plateo seleccionada
  procesoCensos: FormGroup;

  checked = false;
  cargando: boolean = false;
  bandera_error: boolean = false;
  mensaje_error: string;
  filtradas: string = estadosBusqueda.inicio;
  mostrarPaginador: boolean = true;
  mostrarPaginadorDetalle: boolean = false;
  mostrarTablaDetalle: boolean = false;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  columnsCensos = [
    //{ columnDef: 'id_Censos', header: ''},
    { columnDef: "nombre_lote", header: "Lote" },
    { columnDef: "fecha_censo", header: "Fecha del censo" },
    { columnDef: "nombre_comun_plaga", header: "Plaga" },
    { columnDef: "nombre_etapa_plaga", header: "Etapa" },
    { columnDef: "numero_individuos", header: "Numero individuos" },
    { columnDef: "estado_censo", header: "Estado del censo" },
    // { columnDef: 'presencia_lote', header: 'Presencia Lote' },
    // { columnDef: 'presencia_sector', header: 'Presencia sector' },
    { columnDef: "observacion_censo", header: "Observación" },
  ];

  nombreLoteParams: string;
  lotes: any = [];

  constructor(
    public _censosService: CensosService,
    private _loteService: LoteService,
    private activatedRoute: ActivatedRoute
  ) {
    this.estadoCensos = new MatTableDataSource<any>([]);

    this.procesoCensos = new FormGroup({
      fumigado: new FormControl(),
      eliminado: new FormControl(),
      pend_fumigar: new FormControl(),
      nombreLote: new FormControl(),
    });
  }

  ngOnInit(): void {
    this._censosService.getCensos().subscribe(
      (data) => {
        console.log(data);
        this.censos = data.map((element) => {
          element.fechaCenso = new Date(element.fecha_censo);
          element.fecha_censo = moment(element.fechaCenso)
            .locale("es")
            .format("LL");
          element.estado_censo = element.estado_censo.toUpperCase();
          element.nombre_comun_plaga =
            element.nombre_comun_plaga.charAt(0).toUpperCase() +
            element.nombre_comun_plaga.slice(1);
          element.nombre_etapa_plaga =
            element.nombre_etapa_plaga.charAt(0).toUpperCase() +
            element.nombre_etapa_plaga.slice(1);
          if (element.observacion_censo !== null) {
            element.observacion_censo = element.observacion_censo.toLowerCase();
          }
          return element;
        });
        this.cargando = false;
        console.log("CENSOS: ", this.censos);
      },
      (error) => {
        console.log("Error en el consumo de censos", error);
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status", error.status);
        if (error.status == 0) {
          this.mensaje_error = "Servicio no disponible";
        }
      }
    );
    this.cargando = true;

    //obtener el  parametro
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.nombreLoteParams = params.get("lote");
      console.log("parametro por URL ", this.nombreLoteParams);
    });

    this._loteService.getLotes().subscribe(
      (data) => {
        this.lotes = data;
        this.lotes.push({ nombre_lote: "TODOS" });
        console.log("lotes desde censo", this.lotes);
        this.cargando = false;
      },
      (error) => {
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status", error.status);
        if (error.status == 0) {
          this.mensaje_error = "Servicio no disponible";
        }
        console.log(error);
      }
    );
    if (this.nombreLoteParams != null) {
      this.procesoCensos.get("nombreLote").setValue(this.nombreLoteParams);
      this.procesoCensos.get("fumigado").setValue(true);
      this.procesoCensos.get("eliminado").setValue(true);
      this.procesoCensos.get("pend_fumigar").setValue(true);
      var fechaI = new Date();
      this.range
        .get("start")
        .setValue(new Date(fechaI.getFullYear(), fechaI.getMonth(), 1));
      this.range
        .get("end")
        .setValue(new Date(fechaI.getFullYear(), fechaI.getMonth() + 1, 0));
    } else {
      this.procesoCensos.get("nombreLote").setValue("TODOS");
    }
  }

  // ngAfterViewInit() {
  //   // const value = myCell.innerText.trim() === 'true';
  //   // const img = this.renderer.createElement('img');
  //   // img.src = value ? '../../../assets/img/check-mark.png' : '' ;
  // `<img src='../../../assets/img/check-mark.png' alt="check">`
  //   // this.renderer.appendChild(myCell, img);
  // }

  //Filtra por estado: fumigado, eliminado o pendiente por fumigar, por rango de fecha y por nombre de lote.
  filtroEstadoCensos() {
    this.estadoCensos.data = this.censos.filter((censo) => {
      return (
        ((this.procesoCensos.value.fumigado == null &&
          this.procesoCensos.value.elimando == null &&
          this.procesoCensos.value.pend_fumigar == null) ||
          (censo.estado_censo === "FUMIGADO" &&
            this.procesoCensos.value.fumigado) ||
          (censo.estado_censo === "ELIMINADO" &&
            this.procesoCensos.value.eliminado) ||
          (censo.estado_censo === "PENDIENTE POR FUMIGAR" &&
            this.procesoCensos.value.pend_fumigar) ||
          (!this.procesoCensos.value.fumigado &&
            !this.procesoCensos.value.eliminado &&
            !this.procesoCensos.value.pend_fumigar)) &&
        (this.range.get("start").value == null ||
          censo.fechaCenso >= this.range.get("start").value) &&
        (this.range.get("end").value == null ||
          censo.fechaCenso <= this.range.get("end").value) &&
        (this.procesoCensos.value.nombreLote == censo.nombre_lote ||
          this.procesoCensos.value.nombreLote == "TODOS")
      );
    });
    if (this.estadoCensos.data.length != 0) {
      this.filtradas = estadosBusqueda.encontro;
    } else {
      this.filtradas = estadosBusqueda.noEncontro;
    }
    console.log("filtro", this.filtradas);

    //this.cosechas = this.estadoCosechas
    console.log("this.estadoCensos :", this.estadoCensos.data);
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }
}

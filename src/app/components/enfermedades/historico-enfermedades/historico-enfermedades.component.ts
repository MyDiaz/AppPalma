import { Component, OnInit } from '@angular/core';
import { LoteService } from '../../../Servicios/lote.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { EnfermedadesService } from '../../../Servicios/enfermedades.service';


const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro"
}

@Component({
  selector: 'app-historico-enfermedades',
  templateUrl: './historico-enfermedades.component.html',
  styleUrls: ['./historico-enfermedades.component.css']
})
export class HistoricoEnfermedadesComponent implements OnInit {

  historicoEnfermedades:any = []; //listado de registros de enfermedades traidos desde la base de datos
  estadoHistoricoEnfermedades:MatTableDataSource<any>; //objeto que será llenado luego de realizar el filtro
  detalleHistoricoEnfermedades:MatTableDataSource<any>; //listado del detalle de la plateo seleccionada
  procesoHistoricoEnfermedades: FormGroup;

  checked = false;
  cargando:boolean = false; 
  bandera_error:boolean = false;
  mensaje_error:string;
  filtradas:string = estadosBusqueda.inicio;
  mostrarPaginador:boolean = true;
  mostrarPaginadorDetalle:boolean = false;
  mostrarTablaDetalle:boolean = false;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  }); 

  columnsHistoricoEnfermedades = [
    //{ columnDef: 'id_plateos', header: ''},
    { columnDef: 'id_palma', header: 'Palma' },
    { columnDef: 'nombre_enfermedad', header: 'Enfermedades' },
    { columnDef: 'etapa_enfermedad', header: 'Etapa' },
    { columnDef: 'nombre_lote', header: 'Lote' },
    { columnDef: 'fecha_registro_enfermedad', header: 'Fecha' },
    { columnDef: 'observacion_registro_enfermedad', header: 'Observación' }
  ]

  // columnsCosechasDetalle = [
  //   { columnDef: 'cantidad_plateo_diario', header: 'Cantidad plateo'},
  //   { columnDef: 'fecha_plateo_diario', header: 'Fecha plateo'}
  // ]

  nombreLoteParams:string;
  lotes:any = [];

  constructor(public enfermedadesService: EnfermedadesService, private _loteService:LoteService, private activatedRoute: ActivatedRoute) 
  { }

  ngOnInit(): void {
    this.enfermedadesService.getEnfermedadesRegistradas().subscribe( 
      data => {
        this.historicoEnfermedades = data.map( element => {
        element.diaRegistroEnfermedad = new Date (element.fecha_registro_enfermedad);
        return element
      });
      this.cargando = false;
      console.log("H.E. = ",this.historicoEnfermedades)
    }, error => {
      console.log("Error en el consumo de HE", error);
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status HE", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
    })
    this.cargando = true;

    this.enfermedadesService.getEnfermedades().subscribe(
      data => {
        
      }
    ) 

    //llamado para obtener el listado de lotes
    this._loteService.getLotes().subscribe(
      data => {
        this.lotes = data;
        console.log("lotes desde HE", this.lotes)
        this.cargando = false;
      }, 
      error => {
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status lotes HE", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
      }
    )
  }

  submit(){}

  filtroEstadoHistoricoEnfermedades(){}

}

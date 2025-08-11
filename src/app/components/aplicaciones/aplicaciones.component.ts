import { Component, OnInit } from '@angular/core';
import { LoteService } from '../../Servicios/lote.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { EnfermedadesService } from '../../Servicios/enfermedades.service';
import { AgroquimicosService } from '../../Servicios/agroquimicos.service';
import { element } from 'protractor';

const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro"
}

@Component({
  selector: 'app-aplicaciones',
  templateUrl: './aplicaciones.component.html',
  styleUrls: ['./aplicaciones.component.css']
})
export class AplicacionesComponent implements OnInit {

  historicoTratamientos:any = []; //listado de registros de tratamientos (aplicación de agroquimicos) traidos desde la base de datos
  estadoHistoricoTratamientos:MatTableDataSource<any>; //objeto que será llenado luego de realizar el filtro
  detalleHistoricoTratamientos:MatTableDataSource<any>; //listado del detalle de la plateo seleccionada
  procesoHistoricoTratamientos: FormGroup;

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

  columnsHistoricoTratamientos = [
    //{ columnDef: 'id_plateos', header: ''},
    { columnDef: 'nombre_lote', header: 'Lote' },
    { columnDef: 'id_palma', header: 'Palma' },
    { columnDef: 'fecha_tratamiento', header: 'Fecha del tratamiento' },
    { columnDef: 'hora_tratamiento', header: 'Hora' },
    { columnDef: 'nombre_producto_agroquimico', header: 'Producto aplicado' },
    { columnDef: 'dosis', header: 'Dosis' },
    { columnDef: 'unidades', header: 'Unidades' },
    { columnDef: 'tipo_control', header: 'Tipo de control del tratamiento' },
    { columnDef: 'nombre_enfermedad', header: 'Enfermedades' },
    { columnDef: 'etapa_enfermedad', header: 'Etapa' },
    { columnDef: 'descripcion_procedimiento', header: 'Descripción procedimiento' }
  ]

  // columnsCosechasDetalle = [
  //   { columnDef: 'cantidad_plateo_diario', header: 'Cantidad plateo'},
  //   { columnDef: 'fecha_plateo_diario', header: 'Fecha plateo'}
  // ]

  nombreLoteParams:string;
  lotes:any = [];
  //enfermedadesConcat:any = [];

  constructor(public agroquimicosService:AgroquimicosService, private _loteService:LoteService, private activatedRoute: ActivatedRoute) 
  { 
    this.estadoHistoricoTratamientos = new MatTableDataSource<any>([]);
    this.procesoHistoricoTratamientos = new FormGroup({
      nombreLote: new FormControl()
    });
  }

  ngOnInit() {
    this.agroquimicosService.getRegistroAgroquimico().subscribe(
      data => {
        this.historicoTratamientos = data.map( element => {
          element.diaRegistroTratamiento = new Date(element.fecha_tratamiento);
          element.fecha_tratamiento = moment(element.diaRegistroTratamiento).locale('es').format('LL');
          return element
        });
        this.cargando = false;
        console.log("H.T = ", this.historicoTratamientos)
      }, error => {
        console.log("Error en el consumo de HT", error);
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status HE", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
      }
    )

    //obtener el  parametro 
    this.activatedRoute
    .queryParamMap
    .subscribe(params => {
      this.nombreLoteParams = params.get('lote');
      console.log("parametro por URL ", this.nombreLoteParams)
    }); 

    //llamado para obtener el listado de lotes
    this._loteService.getLotes().subscribe(
      data => {
        this.lotes = data;
        this.lotes.push({nombre_lote:'TODOS'});
        console.log("lotes desde HT", this.lotes)
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
    this.cargando = true;
    if(this.nombreLoteParams != null) {
      this.procesoHistoricoTratamientos.get('nombreLote').setValue(this.nombreLoteParams);
      // this.procesoHistoricoEnfermedades.get('fumigado').setValue(true);
      // this.procesoHistoricoEnfermedades.get('eliminado').setValue(true);
      // this.procesoHistoricoEnfermedades.get('pend_fumigar').setValue(true);
      var fechaI = new Date();
      this.range.get('start').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth(), 1));
      this.range.get('end').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth() + 1, 0));
    }else{
      this.procesoHistoricoTratamientos.get('nombreLote').setValue('TODOS');
    }
  }

  submit(){}

  filtroEstadoHistoricoTratamientos(){
    this.estadoHistoricoTratamientos.data = this.historicoTratamientos.filter( tratamiento => {
      console.log('fecha: ', tratamiento.diaRegistroTratamiento)
      console.log('start: ', this.range.get('start').value)
      console.log('end ', this.range.get('end').value)
      console.log((this.range.get('start').value == null || tratamiento.diaRegistroTratamiento >= this.range.get('start').value))
      console.log( (this.range.get('end').value == null || (tratamiento.diaRegistroTratamiento <= this.range.get('end').value)) )
      return (this.range.get('start').value == null || tratamiento.diaRegistroTratamiento >= this.range.get('start').value) && 
      (this.range.get('end').value == null || (tratamiento.diaRegistroTratamiento <= this.range.get('end').value)) &&
      (this.procesoHistoricoTratamientos.value.nombreLote == tratamiento.nombre_lote || this.procesoHistoricoTratamientos.value.nombreLote == "TODOS")
    });

    if(this.estadoHistoricoTratamientos.data.length != 0) {
      this.filtradas = estadosBusqueda.encontro
    }else{
      this.filtradas = estadosBusqueda.noEncontro
    }
    console.log('filtro', this.filtradas)
  
    //this.cosechas = this.estadoCosechas
    console.log("this.estadoRegistroTratamientos:", this.estadoHistoricoTratamientos.data)
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }
  }



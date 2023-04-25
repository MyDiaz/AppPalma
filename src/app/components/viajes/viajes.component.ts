import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { PodasService } from '../../Servicios/podas.service';
import { ActivatedRoute } from '@angular/router';
import { ViajesService } from '../../Servicios/viajes.service';
import { LoteService } from '../../Servicios/lote.service';

const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro"
}

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.component.html',
  styleUrls: ['./viajes.component.css']
})
export class ViajesComponent implements OnInit {

  viajes:any = []; //listado de viajes traidos desde la base de datos
  estadoViaje:MatTableDataSource<any>; //objeto que será llenado luego de realizar el filtro
  //detallePoda:MatTableDataSource<any>; //listado del detalle de la poda seleccionada
  procesoViajes: FormGroup; //formulario usado para filtrar por lote

  checked = false;
  cargando:boolean = false; 
  bandera_error:boolean = false;
  mensaje_error:string;
  filtradas:string = estadosBusqueda.inicio;
  mostrarPaginador:boolean = true;
  mostrarPaginadorDetalle:boolean = false;
  mostrarTablaDetalle:boolean = false;
  nombreLoteParams:string; //nombre del lote que viene por la URL
  lotes:any = []; //listado de lotes que viene del servicio

  range = new FormGroup({ //Inicialización del formulario usado para filtrar por fecha
    start: new FormControl(),
    end: new FormControl(),
  }); 

  columnsViajes = [ //objeto para poder usar la tabla dinamica
    { columnDef: 'nombres_lotes', header: 'Lotes' },
    { columnDef: 'id_viaje', header: 'VIAJE'},
    { columnDef: 'hora_cargue', header: 'Hora de cargue' },
    { columnDef: 'hora_salida', header: 'Hora de salida' },
    { columnDef: 'fecha_viaje', header: 'Fecha' },
    { columnDef: 'kilos_total_racimos_extractora', header: 'Total de kilos en la extractora' },
    { columnDef: 'kilos_total_racimos_finca', header: 'Total de kilos en la finca'},
    { columnDef: 'kilos_totales_calculados', header: 'Total de kilos calculados'}
  ]

  selectedOption:string;

  constructor(private _viajesService:ViajesService, private activatedRoute: ActivatedRoute, private _loteService:LoteService ) 
  {
    this.procesoViajes = new FormGroup({
      nombreLote: new FormControl()
    });

    this.estadoViaje = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this._viajesService.getViajes().subscribe(
      data => {
        this.viajes = data.map( element => { 
          element.diaViajeDate = new Date (element.fecha_viaje); 
          element.fecha_viaje = moment(element.diaViajeDate).format('LL')
          return element
        });
        this.cargando = false;
        console.log("VIAJES: ", this.viajes)
      }, 
      error => {
        console.log("Error en el consumo de viajes", error);
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
      }
    );
    this.cargando = true;
    console.log('VIAJES', this.viajes)

    // this.activatedRoute
    // .queryParamMap
    // .subscribe(params => {
    //   this.nombreLoteParams = params.get('lote');
    //   console.log("nombre del lote desde VIAJES: ", this.nombreLoteParams)
    // });    

    // this._loteService.getLotes().subscribe(
    //   data => {
    //     this.lotes = data;
    //     console.log("lotes desde viajes", this.lotes)
    //     this.cargando = false;
    //     if(this.nombreLoteParams != null) {
    //       this.procesoViajes.get('nombreLote').setValue(this.nombreLoteParams);
    //       // this.procesoPodas.get('activas').setValue(true);
    //       // this.procesoPodas.get('finalizadas').setValue(true);
    //       var fechaI = new Date();
    //       this.range.get('start').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth(), 1));
    //       this.range.get('end').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth() + 1, 0));
    //     }
    //   },
    //   error => {
    //     this.bandera_error = true;
    //     this.mensaje_error = error.error.message;
    //     console.log("error.status", error.status);
    //     if( error.status == 0 ){
    //       this.mensaje_error = "Servicio no disponible"
    //     }
    //     console.log(error);
    //   });
  }

  filtroEstadoViajes(){
    console.log("start", this.range.get('start').value, " end ", this.range.get('end').value)
    console.log("this.selectedOption", this.selectedOption);
    this.estadoViaje.data = this.viajes.filter(viaje => {
      return (this.range.get('start').value == null || viaje.diaViajeDate >= this.range.get('start').value) &&
      (this.range.get('end').value == null || (viaje.diaViajeDate <= this.range.get('end').value)) 
      //&& (this.procesoViajes.value.nombreLote == viaje.nombre_lote || this.procesoViajes.value.nombreLote == "TODOS")
    });
    
    if(this.estadoViaje.data.length != 0) {
      this.filtradas = estadosBusqueda.encontro
    }else{
      this.filtradas = estadosBusqueda.noEncontro
    }
    console.log(this.filtradas)
  
    //this.cosechas = this.estadoCosechas
    console.log("this.estadoViajes :", this.estadoViaje.data)
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }

  submit(){}

}

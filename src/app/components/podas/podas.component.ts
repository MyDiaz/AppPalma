import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { PodasService } from '../../Servicios/podas.service';
import { ActivatedRoute } from '@angular/router';
import { LoteService } from '../../Servicios/lote.service';

const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro"
}

@Component({
  selector: 'app-podas',
  templateUrl: './podas.component.html',
  styleUrls: ['./podas.component.css']
})

export class PodasComponent implements OnInit {

  podas:any = []; //listado de podas traidos desde la base de datos
  estadoPodas:MatTableDataSource<any>; //objeto que será llenado luego de realizar el filtro
  detallePoda:MatTableDataSource<any>; //listado del detalle de la poda seleccionada
  procesoPodas: FormGroup;

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

  columnsCosechas = [
    //{ columnDef: 'id_poda', header: ''},
    { columnDef: 'nombre_lote', header: 'Lote' },
    { columnDef: 'total_palmas_podadas', header: 'Total de palmas podadas' },
    { columnDef: 'inicio_poda', header: 'Fecha de inicio' },
    { columnDef: 'fin_poda', header: 'Fecha de fin poda' },
    { columnDef: 'estado_poda', header: 'Estado' }
  ]

  columnsCosechasDetalle = [
    { columnDef: 'cantidad_poda_diaria', header: 'Cantidad poda'},
    { columnDef: 'fecha_poda_diaria', header: 'Fecha poda'}
  ]
  
  nombreLoteParams:string;
  lotes:any = [];


  constructor( public podasService: PodasService, private activatedRoute: ActivatedRoute, private _loteService:LoteService) { 
    this.procesoPodas = new FormGroup({
      activas: new FormControl(),
      finalizadas: new FormControl(),
      nombreLote: new FormControl()
    });

    this.estadoPodas = new MatTableDataSource<any>([]);
    this.detallePoda = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.podasService.getPodas().subscribe(
      data => {
        this.podas = data.map( element => { 
          element.finPodaDate = new Date (element.fin_poda); 
          element.fin_poda = moment(element.finPodaDate).format('LL')
          element.inicio_poda = moment(element.inicio_poda).format('LL')
          element.callback = () => { this.idBd(element.id_poda) }
          //finPodaDate.getDate() + "-" + (element.finPodaDate.getMonth() + 1) + "-" + element.finPodaDate.getFullYear()
          return element
        });
        this.cargando = false;
        console.log("PODAS: ", this.podas)
      }, 
      error => {
        console.log("Error en el consumo de podas", error);
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
      }
    );
    this.cargando = true;

    this.activatedRoute
    .queryParamMap
    .subscribe(params => {
      this.nombreLoteParams = params.get('lote');
      console.log("Parametro por URL: ", this.nombreLoteParams)
    });    

    this._loteService.getLotes().subscribe(
      data => {
        this.lotes = data;
        this.lotes.push({nombre_lote:'TODOS'});
        console.log("lotes desde podas", this.lotes)
        this.cargando = false;
      },
      error => {
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
        console.log(error);
      });
      if(this.nombreLoteParams != null) {
        this.procesoPodas.get('nombreLote').setValue(this.nombreLoteParams);
        this.procesoPodas.get('activas').setValue(true);
        this.procesoPodas.get('finalizadas').setValue(true);
        var fechaI = new Date();
        this.range.get('start').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth(), 1));
        this.range.get('end').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth() + 1, 0));
      }else{
        this.procesoPodas.get('nombreLote').setValue('TODOS');
      } 
  }

  idBd(id_poda:string){
    this.podasService.getPoda(id_poda).subscribe(
      data => { this.detallePoda.data = data.map( element => {
          element.fecha_poda_diaria = moment(element.fecha_poda_diaria).format('LL')
          return element
      })      
    })
    this.mostrarTablaDetalle = true;
  }

  submit(){}

  //Filtra por estado: activa o finalizada, por rango de fecha y por nombre de lote.
  filtroEstadoPodas(){
    //console.log("start", this.range.get('start').value, " end ", this.range.get('end').value)
    this.estadoPodas.data = this.podas.filter(poda => {
      // console.log('START', (this.range.get('start').value == null || poda.finPodaDate >= this.range.get('start').value))
      // console.log('END', (this.range.get('end').value == null || (poda.finPodaDate <= this.range.get('end').value)))
      // console.log('finalidas', this.procesoPodas.value.finalizadas)
      // console.log('activas', this.procesoPodas.value.activas)
      return (
      (this.procesoPodas.value.finalizadas == null && this.procesoPodas.value.activas == null) ||
      (poda.estado_poda === 'FINALIZADA' && (this.procesoPodas.value.finalizadas)) ||
      (poda.estado_poda === 'ACTIVA' && (this.procesoPodas.value.activas)) ||
      (!this.procesoPodas.value.activas && !this.procesoPodas.value.finalizadas))
      && 
      (this.range.get('start').value == null || poda.finPodaDate >= this.range.get('start').value) &&
      (this.range.get('end').value == null || (poda.finPodaDate <= this.range.get('end').value || poda.estado_poda === 'ACTIVA')) &&
      (this.procesoPodas.value.nombreLote == poda.nombre_lote || this.procesoPodas.value.nombreLote == "TODOS")
    });
    
    if(this.estadoPodas.data.length != 0) {
      this.filtradas = estadosBusqueda.encontro
    }else{
      this.filtradas = estadosBusqueda.noEncontro
    }
    console.log('filtro', this.filtradas)
  
    //this.cosechas = this.estadoCosechas
    console.log("this.estadoPodas :", this.estadoPodas)
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }

}

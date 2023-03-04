import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { PlateosService } from '../../Servicios/plateos.service';

const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro"
}

@Component({
  selector: 'app-plateos',
  templateUrl: './plateos.component.html',
  styleUrls: ['./plateos.component.css']
})
export class PlateosComponent implements OnInit {

  plateos:any = []; //listado de plateos traidos desde la base de datos
  estadoPlateos:MatTableDataSource<any>; //objeto que será llenado luego de realizar el filtro
  detallePlateos:MatTableDataSource<any>; //listado del detalle de la plateo seleccionada
  procesoPlateos: FormGroup;

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
    //{ columnDef: 'id_plateos', header: ''},
    { columnDef: 'nombre_lote', header: 'Lote' },
    { columnDef: 'total_palmas_plateadas', header: 'Total de palmas plateadas' },
    { columnDef: 'inicio_plateo', header: 'Fecha de inicio plateo' },
    { columnDef: 'fin_plateo', header: 'Fecha de fin plateo' },
    { columnDef: 'estado_plateo', header: 'Estado' },
    { columnDef: 'tipo_plateo', header: 'Tipo de plateo realizado' },
  ]

  columnsCosechasDetalle = [
    { columnDef: 'cantidad_plateo_diario', header: 'Cantidad plateo'},
    { columnDef: 'fecha_plateo_diario', header: 'Fecha plateo'}
  ]
  
  constructor( public plateosService: PlateosService) { 
    this.procesoPlateos = new FormGroup({
      activas: new FormControl(),
      finalizadas: new FormControl()
    });

    this.estadoPlateos = new MatTableDataSource<any>([]);
    this.detallePlateos = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.plateosService.getPlateos().subscribe(
      data => {
        this.plateos = data.map( element => { 
          element.finPlateoDate = new Date (element.fin_plateo); 
          element.fin_plateo = moment(element.finPlateoDate).format('LL')
          element.inicio_plateo = moment(element.inicio_plateo).format('LL')
          element.callback = () => { this.idBd(element.id_plateos) }
          //finPlateoDate.getDate() + "-" + (element.finPlateoDate.getMonth() + 1) + "-" + element.finPlateoDate.getFullYear()
          return element
        });
        this.cargando = false;
        console.log("PLATEOS: ", this.plateos)
      }, 
      error => {
        console.log("Error en el consumo de plateos", error);
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
      }
    );
    this.cargando = true;
  }

  idBd(id_plateos:string){
    this.plateosService.getPlateo(id_plateos).subscribe(
      data => { this.detallePlateos.data = data.map( element => {
          element.fecha_plateo_diario = moment(element.fecha_plateo_diario).format('LL')
          return element
      })      
    })
    this.mostrarTablaDetalle = true;
  }

  submit(){}

  filtroEstadoPlateos(){
    console.log("start", this.range.get('start').value, " end ", this.range.get('end').value)
    this.estadoPlateos.data = this.plateos.filter(plateo => {
      // console.log("fecha ", this.range.get('start').value == null, plateo.finPlateoDate > this.range.get('start').value)
      // console.log("fecha 2 ", this.range.get('end').value == null, plateo.finPlateoDate < this.range.get('end').value)
      // console.log("valor start", this.range.get('start').value,"fecha BD start", plateo.inicio_plateo)
      // console.log("valor  end", this.range.get('end').value, "fecha BD end", plateo.fin_plateo)
      return (plateo.estado_plateo === 'FINALIZADA' && this.procesoPlateos.value.finalizadas || plateo.estado_plateo === 'ACTIVA' && this.procesoPlateos.value.activas)
       && (this.range.get('start').value == null || plateo.finPlateoDate >= this.range.get('start').value) && 
       (this.range.get('end').value == null || (plateo.finPlateoDate <= this.range.get('end').value || plateo.estado_plateo === 'ACTIVA'))
    });
    if(this.estadoPlateos.data.length != 0) {
      this.filtradas = estadosBusqueda.encontro
    }else{
      this.filtradas = estadosBusqueda.noEncontro
    }
    console.log(this.filtradas)
  
    //this.cosechas = this.estadoCosechas
    console.log("this.estadoPlateos :", this.estadoPlateos.data)
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }


}

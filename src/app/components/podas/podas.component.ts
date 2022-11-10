import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { PodasService } from '../../Servicios/podas.service'
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
  
  constructor( public podasService: PodasService) { 
    this.procesoPodas = new FormGroup({
      activas: new FormControl(),
      finalizadas: new FormControl()
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

  filtroEstadoPodas(){
    console.log("start", this.range.get('start').value, " end ", this.range.get('end').value)
    this.estadoPodas.data = this.podas.filter(poda => {
      return (poda.estado_poda === 'FINALIZADA' && this.procesoPodas.value.finalizadas || poda.estado_poda === 'ACTIVA' && this.procesoPodas.value.activas)
       && (this.range.get('start').value == null || poda.finPodaDate > this.range.get('start').value) && (this.range.get('end').value == null || poda.finPodaDate < this.range.get('end').value)
    });
    if(this.estadoPodas.data.length != 0) {
      this.filtradas = estadosBusqueda.encontro
    }else{
      this.filtradas = estadosBusqueda.noEncontro
    }
    console.log(this.filtradas)
  
    //this.cosechas = this.estadoCosechas
    console.log("this.estadoPodas :", this.estadoPodas)
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }

}

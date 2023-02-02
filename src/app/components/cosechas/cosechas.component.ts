import { Component, OnInit } from '@angular/core';
import { CosechasService} from '../../Servicios/cosechas.service';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';

const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro"
}
@Component({
  selector: 'app-cosechas',
  templateUrl: './cosechas.component.html',
  styleUrls: ['./cosechas.component.css']
})

export class CosechasComponent implements OnInit {

  
  columnsCosechas = [
    //{ columnDef: 'id_cosecha', header: ''},
    { columnDef: 'nombre_lote', header: 'Lote' },
    { columnDef: 'kilos_totales', header: 'Kilos totales' },
    { columnDef: 'racimos_totales', header: 'Racimos totales' },
    { columnDef: 'inicio_cosecha', header: 'Inicio cosecha' },
    { columnDef: 'fin_cosecha', header: 'Fin cosecha' },
    { columnDef: 'estado_cosecha', header: 'Estado' }
  ]

  columnsCosechasDetalle = [
    { columnDef: 'kilos_racimos_dia', header: 'Cantidad kilos dia'},
    { columnDef: 'cantidad_racimos_dia', header: 'Cantidad racimos dia'},
    { columnDef: 'fecha_cosecha', header: 'Fecha cosecha'}
  ]
  // displayedColumns: string[] = ['nombre_lote', 'kilos_totales', 'racimos_totales', 'inicio_cosecha', 'fin_cosecha', 'estado_cosecha'];
  // namedColumns: string[] = ['Lote', 'Kilos totales', 'Racimos totales', 'Inicio cosecha', 'Fin cosecha', 'Estado'];

  cosechas:any = [];
  cargando:boolean = false;
  bandera_error:boolean = false;
  mensaje_error:string;
  estadoCosechas:MatTableDataSource<any>;
  detalleCosecha:MatTableDataSource<any>;
  procesoCosechas: FormGroup;

  checked = false;
  filtradas:string = estadosBusqueda.inicio;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });  

  mostrarPaginador:boolean = true;
  mostrarPaginadorDetalle:boolean = false;
  mostrarTablaDetalle:boolean = false;

  constructor(private cosechaService:CosechasService) {
    this.procesoCosechas = new FormGroup({
      activas: new FormControl(),
      finalizadas: new FormControl()
    });

    this.estadoCosechas = new MatTableDataSource<any>([]);
    this.detalleCosecha = new MatTableDataSource<any>([]);
   }
   
  idBd(id_cosecha:string){
    this.cosechaService.getCosecha(id_cosecha).subscribe(
      data => { this.detalleCosecha.data = data.map( element => {
          element.fecha_cosecha = moment(element.fecha_cosecha).format('LL')
          return element
      })      
    })
    this.mostrarTablaDetalle = true;
  }
  ngOnInit() {
    this.cosechaService.getCosechas().subscribe(
      data => {
        this.cosechas = data.map( element => { 
          element.finCosechaDate = new Date (element.fin_cosecha); 
          element.fin_cosecha = moment(element.finCosechaDate).format('LL')
          element.inicio_cosecha = moment(element.inicio_cosecha).format('LL')
          element.callback = () => { this.idBd(element.id_cosecha) }
          //finCosechaDate.getDate() + "-" + (element.finCosechaDate.getMonth() + 1) + "-" + element.finCosechaDate.getFullYear()
          return element
        });
        this.cargando = false;
        console.log("COSECHAS: ", this.cosechas)
      }, 
      error => {
        console.log("Error en el consumo de cosechas", error);
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

  filtroEstadoCosechas(){
    console.log("start", this.range.get('start').value, " end ", this.range.get('end').value)
    this.estadoCosechas.data = this.cosechas.filter(cosecha => {
      return (cosecha.estado_cosecha === 'FINALIZADA' && this.procesoCosechas.value.finalizadas || cosecha.estado_cosecha === 'ACTIVA' && this.procesoCosechas.value.activas)
       && (this.range.get('start').value == null || cosecha.finCosechaDate > this.range.get('start').value) && (this.range.get('end').value == null || cosecha.finCosechaDate < this.range.get('end').value)
    });
    if(this.estadoCosechas.data.length != 0) {
      this.filtradas = estadosBusqueda.encontro
    }else{
      this.filtradas = estadosBusqueda.noEncontro
    }
    console.log(this.filtradas)
  
    //this.cosechas = this.estadoCosechas
    console.log("this.estadoCosechas :", this.estadoCosechas)
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }

  submit(){
    console.log("procesoCosechas", this.procesoCosechas.value)
  }

}

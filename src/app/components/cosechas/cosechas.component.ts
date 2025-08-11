import { Component, OnInit } from '@angular/core';
import { CosechasService} from '../../Servicios/cosechas.service';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { LoteService } from '../../Servicios/lote.service';

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
    { columnDef: 'inicio_cosecha', header: 'Fecha de inicio' },
    { columnDef: 'fin_cosecha', header: 'Fecha de finalización' },
    { columnDef: 'estado_cosecha', header: 'Estado del proceso de cosecha' },
    { columnDef: 'kilos_totales', header: 'Kilos totales cosechados' },
    { columnDef: 'racimos_totales', header: 'Racimos totales cosechados' }
  ]

  columnsCosechasDetalle = [
    { columnDef: 'kilos_racimos_dia', header: 'Cantidad kilos cosechados en el día'},
    { columnDef: 'cantidad_racimos_dia', header: 'Cantidad racimos cosechados en el día'},
    { columnDef: 'fecha_cosecha', header: 'Fecha de la cosecha'}
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

  nombreLoteParams:string;
  lotes:any = [];

  constructor(private cosechaService:CosechasService, private activatedRoute: ActivatedRoute, private _loteService:LoteService) {
    this.procesoCosechas = new FormGroup({
      activas: new FormControl(),
      finalizadas: new FormControl(),
      nombreLote: new FormControl()
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
          element.fin_cosecha = moment(element.finCosechaDate).locale("es").format('LL')
          element.inicio_cosecha = moment(element.inicio_cosecha).locale("es").format('LL')
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

     this.activatedRoute
      .queryParamMap
      .subscribe(params => {
        this.nombreLoteParams = params.get('lote');
        console.log("parametro URL: ", this.nombreLoteParams)
      });    

      this._loteService.getLotes().subscribe(
        data => {
          this.lotes = data;
          this.lotes.push({nombre_lote:'TODOS'});
          console.log("lotes desde cosechas", this.lotes)
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
          this.procesoCosechas.get('nombreLote').setValue(this.nombreLoteParams);
          this.procesoCosechas.get('activas').setValue(true);
          this.procesoCosechas.get('finalizadas').setValue(true);
          var fechaI = new Date();
          this.range.get('start').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth(), 1));
          this.range.get('end').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth() + 1, 0));
        }else{
          this.procesoCosechas.get('nombreLote').setValue('TODOS');
        }

  }

  //Filtra por estado: activa o finalizada, por rango de fecha y por nombre de lote.
  filtroEstadoCosechas(){
    //console.log("start", this.range.get('start').value, " end ", this.range.get('end').value)
    this.estadoCosechas.data = this.cosechas.filter(cosecha => {
      return (
      (this.procesoCosechas.value.finalizadas == null && this.procesoCosechas.value.activas == null) ||
      (cosecha.estado_cosecha === 'FINALIZADA' && this.procesoCosechas.value.finalizadas) ||
      (cosecha.estado_cosecha === 'ACTIVA' && this.procesoCosechas.value.activas)
      (!this.procesoCosechas.value.activas && !this.procesoCosechas.value.finalizadas))
      && 
      (this.range.get('start').value == null || cosecha.finCosechaDate >= this.range.get('start').value) && 
      (this.range.get('end').value == null || (cosecha.finCosechaDate <= this.range.get('end').value) || cosecha.estado_cosecha === 'ACTIVA') &&
      (this.procesoCosechas.value.nombreLote == cosecha.nombre_lote || this.procesoCosechas.value.nombreLote == "TODOS")
    });
    if(this.estadoCosechas.data.length != 0) {
      this.filtradas = estadosBusqueda.encontro
    }else{
      this.filtradas = estadosBusqueda.noEncontro 
    }
    console.log("filtro", this.filtradas)
  
    //this.cosechas = this.estadoCosechas
    console.log("this.estadoCosechas :", this.estadoCosechas)
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }

  submit(){
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }

}

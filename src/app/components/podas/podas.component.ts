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
    { columnDef: 'fin_poda', header: 'Fecha de finalización'},
    { columnDef: 'estado_poda', header: 'Estado del proceso de la poda' }
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

    this.estadoPodas = new MatTableDataSource<any>();
    this.detallePoda = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {

    // Esto NO filtra nada todavía, solo define la regla que filtra por estado: activa o finalizada, por rango de fecha y por nombre de lote. Decide si UNA FILA entra o no.
      this.estadoPodas.filterPredicate = (poda, filter: string) => {

        const filtros = JSON.parse(filter);
         console.log('Filtro aplicado:', filtros, 'Fila:', poda.id_poda);
        // ===== FECHA =====
        const fecha = poda.finPodaDate;
        let cumpleFecha = true;

        if (filtros.start) {
          const start = new Date(filtros.start);
          start.setHours(0, 0, 0, 0);
          cumpleFecha = fecha >= start;
        }

        if (cumpleFecha && filtros.end) {
          const end = new Date(filtros.end);
          end.setHours(23, 59, 59, 999);
          cumpleFecha = fecha <= end;
        }

        // ===== ESTADO =====
        let cumpleEstado = true;

        if (filtros.activas || filtros.finalizadas) {
          cumpleEstado =
            (poda.estado_poda === 'ACTIVA' && filtros.activas) ||
            (poda.estado_poda === 'FINALIZADA' && filtros.finalizadas);
        }

        // ===== LOTE =====
        const cumpleLote =
          filtros.nombreLote === 'TODOS' ||
          filtros.nombreLote === poda.nombre_lote;

        return cumpleFecha && cumpleEstado && cumpleLote;
      };
    
    this.podasService.getPodas().subscribe(
      data => {
        this.podas = data.map( element => { 

          const inicioDate = new Date(element.inicio_poda) ? new Date(element.inicio_poda) : null;;
          const finDate = new Date(element.fin_poda) ? new Date(element.fin_poda) : null;

          return {
            ...element,
            inicioPodaDate: inicioDate,
            finPodaDate: finDate,

            inicio_poda: inicioDate ? moment(inicioDate).locale("es").format('LL') : '',
            fin_poda: finDate ? moment(finDate).locale("es").format('LL'): '',
            
            callback: () => { this.idBd(element.id_poda) }
            //finPodaDate.getDate() + "-" + (element.finPodaDate.getMonth() + 1) + "-" + element.finPodaDate.getFullYear()
          }
        });
        // Acá se asigna al elemento MatTableDataSource
        this.estadoPodas.data = this.podas;

        this.cargando = false;
        console.log("PODAS cargadas en datasource :", this.estadoPodas.data);
      }, 
      error => {
        console.log("Error en el consumo de podas: ", error);
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible."
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

  // decide CUÁNDO y CON QUÉ filtros se recalcula la tabla.
  filtroEstadoPodas(){
    const filtros = {
    start: this.range.get('start')?.value,
    end: this.range.get('end')?.value,
    activas: this.procesoPodas.value.activas,
    finalizadas: this.procesoPodas.value.finalizadas,
    nombreLote: this.procesoPodas.value.nombreLote
  };

  this.estadoPodas.filter = JSON.stringify(filtros);

  this.filtradas =
    this.estadoPodas.filteredData.length > 0
      ? estadosBusqueda.encontro
      : estadosBusqueda.noEncontro;

      console.log('Filtros enviados:', filtros);
  }

}

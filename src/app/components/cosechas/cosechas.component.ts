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

    this.estadoCosechas.filterPredicate = (cosecha, filter: string) => {

      const filtros = JSON.parse(filter);
      const fecha = cosecha.finCosechaDate || cosecha.inicioCosechaDate;
      let cumpleFecha = true;

      if (filtros.start && fecha) {
        const start = new Date(filtros.start);
        start.setHours(0,0,0,0);
        cumpleFecha = fecha >= start;
      }

      if (cumpleFecha && filtros.end && fecha) {
        const end = new Date(filtros.end);
        end.setHours(23,59,59,999);
        cumpleFecha = fecha <= end;
      }

      let cumpleEstado = true;

      if (filtros.activas || filtros.finalizadas) {
        cumpleEstado =
          (cosecha.estado_cosecha === 'ACTIVA' && filtros.activas) ||
          (cosecha.estado_cosecha === 'FINALIZADA' && filtros.finalizadas);
      }

      const cumpleLote =
        filtros.nombreLote === 'TODOS' ||
        filtros.nombreLote === cosecha.nombre_lote;

        console.log(
        cosecha.nombre_lote,
        "fecha:", fecha,
        "cumpleFecha:", cumpleFecha
      );

      console.log("Filtrando:", cosecha.nombre_lote);

      return cumpleFecha && cumpleEstado && cumpleLote;
  };


    this.cosechaService.getCosechas().subscribe(
      data => {
        this.cosechas = data.map( element => {  
          
          const inicioDate = element.inicio_cosecha ? new Date(element.inicio_cosecha): null;
          const finDate = element.fin_cosecha ? new Date(element.fin_cosecha) : null;

          return {
            ...element,

          inicioCosechaDate: inicioDate,
          finCosechaDate: finDate,

          inicio_cosecha: inicioDate ? moment(inicioDate).locale("es").format('LL') : '',
          fin_cosecha: finDate ? moment(finDate).locale("es").format('LL') : '',

          callback: () => { this.idBd(element.id_cosecha) } 

          }
        });

        this.estadoCosechas.data = this.cosechas;
        console.log("COSECHAS cargadas en el datasource:", this.estadoCosechas.data);
        this.cargando = false;
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
    const filtros = {
      start: this.range.get('start')?.value,
      end: this.range.get('end')?.value,
      activas: this.procesoCosechas.value.activas,
      finalizadas: this.procesoCosechas.value.finalizadas,
      nombreLote: this.procesoCosechas.value.nombreLote
    };

    this.estadoCosechas.filter = JSON.stringify(filtros);
    const rows = this.estadoCosechas.filteredData.length;

      if(rows > 0){
      this.filtradas = estadosBusqueda.encontro;
    } else {
      this.filtradas = estadosBusqueda.noEncontro;
    }

    console.log("Rows en datasource:", this.estadoCosechas.filteredData.length);
    console.log("Filtros enviados:", filtros);
  }

  submit(){
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }

}

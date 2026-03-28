import { Component, OnInit } from '@angular/core';
import { CosechasService } from '../../Servicios/cosechas.service';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { LoteService } from '../../Servicios/lote.service';
import { FertilizacionesService } from '../../Servicios/fertilizaciones.service';

const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro"
}
@Component({
  selector: 'app-fertilizaciones',
  templateUrl: './fertilizaciones.component.html',
  styleUrls: ['./fertilizaciones.component.css']
})

export class FertilizacionesComponent implements OnInit {

  
  columnsFertilizaciones = [
    { columnDef: 'nombre_lote', header: 'Lote' },
    { columnDef: 'fecha_inicio', header: 'Fecha de inicio' },
    { columnDef: 'fecha_fin', header: 'Fecha de fin' },
    { columnDef: 'estado_fertilizacion', header: 'Estado de la fertilización' },
    { columnDef: 'total_palmas', header: 'Total de palmas fertilizadas' }
  ]

  columnsFertilizacionesDetalle = [
    { columnDef: 'kilos_racimos_dia', header: 'Cantidad kilos cosechados en el día'},
    { columnDef: 'cantidad_racimos_dia', header: 'Cantidad racimos cosechados en el día'},
    { columnDef: 'fecha_cosecha', header: 'Fecha de la cosecha'}
  ]
  // displayedColumns: string[] = ['nombre_lote', 'kilos_totales', 'racimos_totales', 'inicio_cosecha', 'fin_cosecha', 'estado_cosecha'];
  // namedColumns: string[] = ['Lote', 'Kilos totales', 'Racimos totales', 'Inicio cosecha', 'Fin cosecha', 'Estado'];

  fertilizaciones:any = [];
  cargando:boolean = false;
  bandera_error:boolean = false;
  mensaje_error:string;
  estadoFertilizaciones:MatTableDataSource<any>;
  detalleFertilizacion:MatTableDataSource<any>;
  procesoFertilizaciones: FormGroup;

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

  constructor(
    private cosechasService: CosechasService,
    private fertilizacionesService: FertilizacionesService,
    private activatedRoute: ActivatedRoute,
    private _loteService: LoteService
  ) {
    this.procesoFertilizaciones = new FormGroup({
      activas: new FormControl(),
      finalizadas: new FormControl(),
      nombreLote: new FormControl()
    });

    this.estadoFertilizaciones = new MatTableDataSource<any>([]);
    this.detalleFertilizacion = new MatTableDataSource<any>([]);
   }
   
  idBd(id:string){
    this.cosechasService.getCosecha(id).subscribe(
      data => { this.detalleFertilizacion.data = data.map( element => {
          element.fecha_cosecha = moment(element.fecha_cosecha).format('LL')
          return element
      })      
    })
    this.mostrarTablaDetalle = true;
  }

  ngOnInit() {

    this.estadoFertilizaciones.filterPredicate = (fertilizacion, filter: string) => {

      const filtros = JSON.parse(filter);
      const fecha = fertilizacion.finCosechaDate || fertilizacion.inicioCosechaDate;
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
          (fertilizacion.estado_fertilizacion === 'ACTIVA' && filtros.activas) ||
          (fertilizacion.estado_fertilizacion === 'FINALIZADA' && filtros.finalizadas);
      }

      const cumpleLote =
        filtros.nombreLote === 'TODOS' ||
        filtros.nombreLote === fertilizacion.nombre_lote;

        console.log(
        fertilizacion.nombre_lote,
        "fecha:", fecha,
        "cumpleFecha:", cumpleFecha
      );

      console.log("Filtrando:", fertilizacion.nombre_lote);

      return cumpleFecha && cumpleEstado && cumpleLote;
  };


    this.fertilizacionesService.getFertilizaciones().subscribe(
      data => {
        this.fertilizaciones = data.map( element => {  
          
          const inicioDate = element.fecha_inicio ? new Date(element.fecha_inicio) : null;
          const finDate = element.fecha_fin ? new Date(element.fecha_fin) : null;

          return {
            ...element,

            inicioCosechaDate: inicioDate,
            finCosechaDate: finDate,

            fecha_inicio: inicioDate ? moment(inicioDate).locale("es").format('LL') : '',
            fecha_fin: finDate ? moment(finDate).locale("es").format('LL') : '',

            callback: () => { this.idBd(element.id_fertilizacion || element.id_cosecha) } 

          }
        });

        this.estadoFertilizaciones.data = this.fertilizaciones;
        console.log("FERTILIZACIONES cargadas en el datasource:", this.estadoFertilizaciones.data);
        this.cargando = false;
      }, 
      error => {
      console.log("Error en el consumo de fertilizaciones", error);
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
          console.log("lotes desde fertilizaciones", this.lotes)
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
          this.procesoFertilizaciones.get('nombreLote').setValue(this.nombreLoteParams);
          this.procesoFertilizaciones.get('activas').setValue(true);
          this.procesoFertilizaciones.get('finalizadas').setValue(true);
          var fechaI = new Date();
          this.range.get('start').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth(), 1));
          this.range.get('end').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth() + 1, 0));
        }else{
          this.procesoFertilizaciones.get('nombreLote').setValue('TODOS');
        }

  }

  //Filtra por estado: activa o finalizada, por rango de fecha y por nombre de lote.
  filtroEstadoFertilizaciones(){
    const filtros = {
      start: this.range.get('start')?.value,
      end: this.range.get('end')?.value,
      activas: this.procesoFertilizaciones.value.activas,
      finalizadas: this.procesoFertilizaciones.value.finalizadas,
      nombreLote: this.procesoFertilizaciones.value.nombreLote
    };

    this.estadoFertilizaciones.filter = JSON.stringify(filtros);
    const rows = this.estadoFertilizaciones.filteredData.length;

      if(rows > 0){
      this.filtradas = estadosBusqueda.encontro;
    } else {
      this.filtradas = estadosBusqueda.noEncontro;
    }

    console.log("Rows en datasource:", this.estadoFertilizaciones.filteredData.length);
    console.log("Filtros enviados:", filtros);
  }

  submit(){
    //console.log("procesoFertilizaciones", this.procesoFertilizaciones.value)
  }

}

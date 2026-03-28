import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
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
    { columnDef: 'fecha_fertilizacion_diaria', header: 'Fecha fertilización' },
    { columnDef: 'nombre_fertilizante', header: 'Fertilizante' },
    { columnDef: 'dosis', header: 'Dosis' },
    { columnDef: 'unidades', header: 'Unidades' },
    { columnDef: 'cantidad_fertilizacion_diaria', header: 'Palmas fertilizadas diario' },
    { columnDef: 'orientacion_inicio', header: 'Orientación inicio' },
    { columnDef: 'linea_inicio', header: 'Línea inicio' },
    { columnDef: 'numero_inicio', header: 'Número inicio' },
    { columnDef: 'orientacion_fin', header: 'Orientación fin'},
    { columnDef: 'linea_fin', header: 'Línea fin' },
    { columnDef: 'numero_fin', header: 'Número fin' }
  ]

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
   
  cargarDetalleFertilizacion(id_fertilizacion: string) {
    if (!id_fertilizacion) {
      return;
    }
    this.bandera_error = false;
    this.mostrarTablaDetalle = false;
    this.fertilizacionesService.getFertilizacion(id_fertilizacion).subscribe(
      data => {
        const detalle = Array.isArray(data) ? data : [data];
        this.detalleFertilizacion.data = detalle.map(element => {
          const fecha = element.fecha_fertilizacion_diaria ? moment(element.fecha_fertilizacion_diaria).locale("es").format('LL') : '';
          return {
            ...element,
            fecha_fertilizacion_diaria: fecha
          };
        });
        this.mostrarTablaDetalle = this.detalleFertilizacion.data.length > 0;
      },
      error => {
        this.bandera_error = true;
        this.mensaje_error = error.error?.message || 'No se pudo cargar el detalle de fertilización';
        if (error.status == 0) {
          this.mensaje_error = "Servicio no disponible";
        }
      }
    );
  }

  onFertilizacionRowClick(row: any) {
    if (!row.id_fertilizacion) {
      return;
    }
    this.cargarDetalleFertilizacion(row.id_fertilizacion);
  }

  ngOnInit() {

    this.estadoFertilizaciones.filterPredicate = (fertilizacion, filter: string) => {

      const filtros = JSON.parse(filter);
      const fecha = fertilizacion.finFertilizacionDate || fertilizacion.inicioFertilizacionDate;
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

            inicioFertilizacionDate: inicioDate,
            finFertilizacionDate: finDate,

            fecha_inicio: inicioDate ? moment(inicioDate).locale("es").format('LL') : '',
            fecha_fin: finDate ? moment(finDate).locale("es").format('LL') : ''
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

import { Component, OnInit } from '@angular/core';
import { LoteService } from '../../../Servicios/lote.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { EnfermedadesService } from '../../../Servicios/enfermedades.service';
import { element } from 'protractor';


const estadosBusqueda = {
  inicio: "inicio",
  encontro: "encontro",
  noEncontro: "noEncontro"
}

@Component({
  selector: 'app-historico-enfermedades',
  templateUrl: './historico-enfermedades.component.html',
  styleUrls: ['./historico-enfermedades.component.css']
})
export class HistoricoEnfermedadesComponent implements OnInit {

  historicoEnfermedades:any = []; //listado de registros de enfermedades traidos desde la base de datos
  estadoHistoricoEnfermedades:MatTableDataSource<any>; //objeto que será llenado luego de realizar el filtro
  detalleHistoricoEnfermedades:MatTableDataSource<any>; //listado del detalle de la plateo seleccionada
  procesoHistoricoEnfermedades: FormGroup;

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

  columnsHistoricoEnfermedades = [
    //{ columnDef: 'id_plateos', header: ''},
    { columnDef: 'id_palma', header: 'Palma' },
    { columnDef: 'nombre_enfermedad', header: 'Enfermedades' },
    { columnDef: 'etapa_enfermedad', header: 'Etapa' },
    { columnDef: 'nombre_lote', header: 'Lote' },
    { columnDef: 'fecha_registro_enfermedad', header: 'Fecha' },
    { columnDef: 'observacion_registro_enfermedad', header: 'Observación' }
  ]

  // columnsCosechasDetalle = [
  //   { columnDef: 'cantidad_plateo_diario', header: 'Cantidad plateo'},
  //   { columnDef: 'fecha_plateo_diario', header: 'Fecha plateo'}
  // ]

  nombreLoteParams:string;
  lotes:any = [];
  enfermedadesConcat:any = [];

  constructor(public enfermedadesService: EnfermedadesService, private _loteService:LoteService, private activatedRoute: ActivatedRoute) 
  {
    this.estadoHistoricoEnfermedades = new MatTableDataSource<any>([]);
    this.procesoHistoricoEnfermedades = new FormGroup({
      nombreLote: new FormControl(),
      enfermedadConcat: new FormControl()
    });
  }

  ngOnInit(): void {
    this.enfermedadesService.getEnfermedadesRegistradas().subscribe( 
      data => {
        this.historicoEnfermedades = data.map( element => {
        element.diaRegistroEnfermedad = new Date (element.fecha_registro_enfermedad);
        element.fecha_registro_enfermedad = moment(element.diaRegistroEnfermedad).locale('es').format('LL');
        element.nombre_enfermedad = element.nombre_enfermedad.toLowerCase();
        return element
      });
      this.cargando = false;
      console.log("H.E. = ",this.historicoEnfermedades)
    }, error => {
      console.log("Error en el consumo de HE", error);
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status HE", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
    })
    this.cargando = true;

    this.enfermedadesService.getEnfermedadesConcat().subscribe(
      data => {
        this.enfermedadesConcat = data.map( element => {
          element.concat = element.concat.toLowerCase();
          return element
        })
        this.enfermedadesConcat.push({concat:'TODAS'});
        console.log("this.enfermedadesConcat", this.enfermedadesConcat)
      }
    )
    
    //obtener el  parametro 
    this.activatedRoute
    .queryParamMap
    .subscribe(params => {
      this.nombreLoteParams = params.get('lote');
      console.log("parametro por URL ", this.nombreLoteParams)
    }); 

    //llamado para obtener el listado de lotes
    this._loteService.getLotes().subscribe(
      data => {
        this.lotes = data;
        this.lotes.push({nombre_lote:'TODOS'});
        console.log("lotes desde HE", this.lotes)
        this.cargando = false;
      }, 
      error => {
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status lotes HE", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
      }
    )
    if(this.nombreLoteParams != null) {
      this.procesoHistoricoEnfermedades.get('nombreLote').setValue(this.nombreLoteParams);
      // this.procesoHistoricoEnfermedades.get('fumigado').setValue(true);
      // this.procesoHistoricoEnfermedades.get('eliminado').setValue(true);
      // this.procesoHistoricoEnfermedades.get('pend_fumigar').setValue(true);
      var fechaI = new Date();
      this.range.get('start').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth(), 1));
      this.range.get('end').setValue(new Date(fechaI.getFullYear(), fechaI.getMonth() + 1, 0));
    }else{
      this.procesoHistoricoEnfermedades.get('nombreLote').setValue('TODOS');
    }
    this.procesoHistoricoEnfermedades.get('enfermedadConcat').setValue('TODAS')
  }

  submit(){}

  filtroEstadoHistoricoEnfermedades(){
    this.estadoHistoricoEnfermedades.data = this.historicoEnfermedades.filter(enfermedad => {
    // console.log("000000", this.procesoHistoricoEnfermedades.value.enfermedadConcat, enfermedad.nombre_enfermedad + ' ' + (enfermedad.etapa_enfermedad ?? '') )
    // console.log("CONDICIONAL", this.procesoHistoricoEnfermedades.value.enfermedadConcat == enfermedad.nombre_enfermedad + ' ' + (enfermedad.etapa_enfermedad ?? '') ||
    // this.procesoHistoricoEnfermedades.value.enfermedadConcat == "TODAS" )
    // console.log("lllllllllllllll",this.procesoHistoricoEnfermedades.value.enfermedadConcat == "TODAS", this.procesoHistoricoEnfermedades.value.enfermedadConcat )
      return (this.procesoHistoricoEnfermedades.value.enfermedadConcat == enfermedad.nombre_enfermedad + ' ' + (enfermedad.etapa_enfermedad ?? '') ||
      this.procesoHistoricoEnfermedades.value.enfermedadConcat == "TODAS") 
      && 
      (this.range.get('start').value == null || enfermedad.diaRegistroEnfermedad >= this.range.get('start').value) && 
      (this.range.get('end').value == null || (enfermedad.diaRegistroEnfermedad <= this.range.get('end').value)) &&
      (this.procesoHistoricoEnfermedades.value.nombreLote == enfermedad.nombre_lote || this.procesoHistoricoEnfermedades.value.nombreLote == "TODOS") 
    });
    if(this.estadoHistoricoEnfermedades.data.length != 0) {
      this.filtradas = estadosBusqueda.encontro
    }else{
      this.filtradas = estadosBusqueda.noEncontro
    }
    console.log('filtro', this.filtradas)
  
    //this.cosechas = this.estadoCosechas
    console.log("this.estadoCensos :", this.estadoHistoricoEnfermedades.data)
    //console.log("procesoCosechas", this.procesoCosechas.value)
  }

}

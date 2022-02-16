import { Component, OnInit } from '@angular/core';
import { CosechasService} from '../../Servicios/cosechas.service';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-cosechas',
  templateUrl: './cosechas.component.html',
  styleUrls: ['./cosechas.component.css']
})
export class CosechasComponent implements OnInit {

  

  displayedColumns: string[] = ['nombre_lote', 'kilos_totales', 'racimos_totales', 'inicio_cosecha', 'fin_cosecha', 'estado_cosecha'];
  cosechas:any = [];
  cargando:boolean = false;
  bandera_error:boolean = false;
  mensaje_error:string;

  checked = false;
  indeterminate = false;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });


  //   { nombre_lote: '', 
  //   kilos_totales: '',
  //   racimos_totales: '',
  //   inicio_cosecha: '',
  //   fin_cosecha: '',
  //   estado_cosecha: ''
  //   }
  

  constructor(private cosechaService:CosechasService) {
   }

  ngOnInit() {
    this.cosechaService.getCosechas().subscribe(
      data => {
        this.cosechas = data;
        this.cargando = false;
        console.log(data)
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

  filtroEstadoCosechas(cosechas){
    let cosechasActivas = cosechas.filter(cosechas => cosechas.estado_cosecha === "ACTIVA");

  }

}

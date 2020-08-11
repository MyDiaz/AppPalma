import { Component, OnInit } from '@angular/core';
import { EnfermedadesService } from '../../Servicios/enfermedades.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-listado-enfermedades',
  templateUrl: './listado-enfermedades.component.html',
  styles: []
})
export class ListadoEnfermedadesComponent implements OnInit {

  enfermedad:any = [];
  NombreEnfermedadForm:FormGroup;
  NombreEnfermedadEditar:string;
  bandera:boolean = false;
  mensaje_error:string;

  constructor(private EnfermedadesService:EnfermedadesService) {
    this.EnfermedadesService.getEnfermedades().subscribe( data => {
      this.enfermedad = data;
    }, err => {
      this.bandera = true;
      this.mensaje_error = err.error.mensaje;
      console.log(err);
      if( err.status == 0 ) this.mensaje_error = "Servicio no disponible"
    })
    this.NombreEnfermedadForm = new FormGroup({
      nombre_enfermedad: new FormControl()
    }) 
    
   }

  ngOnInit() {
  }

  enviarEnfermedad(){

    console.log(this.NombreEnfermedadForm);
  }

}

import { Component } from '@angular/core';
import { EnfermedadesService } from '../../Servicios/enfermedades.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listado-enfermedades',
  templateUrl: './listado-enfermedades.component.html',
  styles: []
})
export class ListadoEnfermedadesComponent {

  enfermedadesEtapas:any = [];
  enfermedades:any = [];
  NombreEnfermedadForm:FormGroup;
  NombreEnfermedadEditar:string;
  bandera:boolean = false;
  mensaje_error:string;
  
  constructor(private EnfermedadesService:EnfermedadesService, private router:Router,
    private activatedRoute:ActivatedRoute) {
    
    this.EnfermedadesService.getEnfermedadesEtapas().subscribe( data => {
      this.enfermedadesEtapas = data;
    }, err => {
      this.bandera = true;
      this.mensaje_error = err.error.mensaje;
      console.log(err);
      if( err.status == 0 ) this.mensaje_error = "Servicio no disponible"
    })    

    this.EnfermedadesService.getEnfermedades().subscribe( data => {
      this.enfermedades = data;
    }, err => {
      this.bandera = true;
      this.mensaje_error = err.error.mensaje;
      console.log(err);
      if( err.status == 0 ) this.mensaje_error = "Servicio no disponible"
    })

    this.NombreEnfermedadForm = new FormGroup({
      id_enfermedad: new FormControl()
    }) 
    
   }

  editarEnfermedad(){
    console.log(this.NombreEnfermedadForm.value.id_enfermedad.toString());
    this.router.navigate(['editar-enfermedad',this.NombreEnfermedadForm.value.id_enfermedad.toString()], { relativeTo: this.activatedRoute });
  }

  enviarEnfermedad(){
    console.log(this.NombreEnfermedadForm.value.id_enfermedad);
  }

}

import { Component } from '@angular/core';
import { EnfermedadesService } from '../../Servicios/enfermedades.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-enfermedades',
  templateUrl: './listado-enfermedades.component.html',
  styles: []
})
export class ListadoEnfermedadesComponent {

  NombreEnfermedadForm: FormGroup;

  enfermedadesEtapas: any = [];
  hayEnfermedadesEtapas: boolean = false;

  enfermedades: any = [];
  hayEnfermedades: boolean = false;

  bandera: boolean = false;
  cargando: boolean = false;
  mensaje_error: string;

  constructor(private EnfermedadesService: EnfermedadesService, private router: Router) {

    //enfermedades con etapas
    this.getEtapasyEnfermedades();

    this.NombreEnfermedadForm = new FormGroup({
      nombre_enfermedad: new FormControl()
    });
  }

  getEtapasyEnfermedades() {
    this.EnfermedadesService.getEnfermedadesEtapas().subscribe(data => {
      this.enfermedadesEtapas = this.groupBy(data, "nombre_enfermedad");
      this.cargando = true;
      if (this.enfermedadesEtapas.length > 0) this.hayEnfermedadesEtapas = true;
      this.getEnfermedades();
    }, err => {
      this.bandera = true;
      this.mensaje_error = err.error.mensaje;
      console.log(err);
      if (err.status == 0) this.mensaje_error = "Servicio no disponible"
    });
    //this.cargando = false;
  }


  getEnfermedades() {
    //enfermedades 
    this.EnfermedadesService.getEnfermedades().subscribe(data => {
      const enfermedadesConEtapas = new Set(
        this.enfermedadesEtapas.map(item => item[0].nombre_enfermedad)
      );

      // Filter the second array to keep only diseases not present in first array
      const filteredData = (data as []).filter(
        enfermedad => !enfermedadesConEtapas.has((enfermedad as any).nombre_enfermedad)
      );
      this.enfermedades = filteredData;
      this.cargando = true;
      if (this.enfermedades.length > 0) this.hayEnfermedades = true;
    }, err => {
      this.bandera = true;
      this.mensaje_error = err.error.mensaje;
      console.log(err);
      if (err.status == 0) this.mensaje_error = "Servicio no disponible"
    });

  }

  enviarEnfermedad() {
    console.log("this.NombreEnfermedadForm.value", this.NombreEnfermedadForm.value);
  }

  editarEnfermedad() {
    if (this.NombreEnfermedadForm.value.nombre_enfermedad.startsWith("enfermedad-")) {
      this.router.navigate(['editar-enfermedad', this.NombreEnfermedadForm.value.nombre_enfermedad.replace("enfermedad-", "")]);
    }
    else {
      this.router.navigate(['editar-etapa-enfermedad', this.NombreEnfermedadForm.value.nombre_enfermedad.replace("etapa-", "")]);
    }
  }

  eliminarEnfermedad() {
    if (this.NombreEnfermedadForm.value.nombre_enfermedad.startsWith("enfermedad-")) {
      var enfermedad = this.NombreEnfermedadForm.value.nombre_enfermedad.replace("enfermedad-", "");
    }
    else {
      var enfermedad = this.NombreEnfermedadForm.value.nombre_enfermedad.replace("etapa-", "");
    }
    Swal.fire({
      text: 'Estás seguro de eliminar la enfermedad?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true
    }).then( (value) => {
      if(value.isConfirmed){
        this.EnfermedadesService.eliminarEnfermedad(enfermedad).subscribe(
          resp => {
            let rta = resp;
            Swal.fire({
              title: this.NombreEnfermedadForm.value.nombre_enfermedad.replace("enfermedad-", ""),
              html : 'Se eliminó correctamente la enfermedad',
              icon : 'success'
            });
            window.location.reload();
          },(error) => {
            Swal.fire({
              title: this.NombreEnfermedadForm.value.nombre_enfermedad,
              html : error.error.message,
              icon : 'error'
            });
          }
        )
      }
    })
  }

  esValido() {
    return this.NombreEnfermedadForm.value.nombre_enfermedad != null;
  }

  private groupBy(collection, property) {
    var i = 0, val, index, values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1)
        result[index].push(collection[i]);
      else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }
}
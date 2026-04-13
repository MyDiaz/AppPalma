import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EnfermedadesService } from '../../Servicios/enfermedades.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-enfermedades',
  templateUrl: './listado-enfermedades.component.html',
  styles: [],
})
export class ListadoEnfermedadesComponent implements OnInit {
  NombreEnfermedadForm: FormGroup;
  enfermedadesEtapas: any[] = [];
  hayEnfermedadesEtapas = false;
  enfermedades: any[] = [];
  hayEnfermedades = false;
  bandera = false;
  cargando = false;
  mensajeError = '';

  constructor(private enfermedadesService: EnfermedadesService, private router: Router) {
    this.NombreEnfermedadForm = new FormGroup({
      nombre_enfermedad: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.cargarEnfermedades();
  }

  cargarEnfermedades(): void {
    this.bandera = false;
    this.hayEnfermedades = false;
    this.hayEnfermedadesEtapas = false;
    this.enfermedades = [];
    this.enfermedadesEtapas = [];
    this.cargando = true;
    this.getEtapasyEnfermedades();
  }

  getEtapasyEnfermedades(): void {
    this.enfermedadesService.getEnfermedadesEtapas().subscribe(
      (data: any[]) => {
        this.enfermedadesEtapas = this.groupBy(data, 'nombre_enfermedad');
        if (this.enfermedadesEtapas.length > 0) {
          this.hayEnfermedadesEtapas = true;
        }
        this.getEnfermedades();
      },
      err => {
        this.bandera = true;
        this.mensajeError = err.error.mensaje;
        console.log(err);
        this.cargando = false;
        if (err.status === 0) {
          this.mensajeError = 'Servicio no disponible';
        }
      }
    );
  }

  getEnfermedades(): void {
    this.enfermedadesService.getEnfermedades().subscribe(
      data => {
        const enfermedadesConEtapas = new Set(
          this.enfermedadesEtapas.map(item => item[0].nombre_enfermedad)
        );
        const filteredData = (data as []).filter(
          enfermedad => !enfermedadesConEtapas.has((enfermedad as any).nombre_enfermedad)
        );
        this.enfermedades = filteredData;
        this.cargando = false;
        this.hayEnfermedades = this.enfermedades.length > 0;
      },
      err => {
        this.bandera = true;
        this.mensajeError = err.error.mensaje;
        console.log(err);
        this.cargando = false;
        if (err.status === 0) {
          this.mensajeError = 'Servicio no disponible';
        }
      }
    );
  }

  enviarEnfermedad(): void {
    console.log('this.NombreEnfermedadForm.value', this.NombreEnfermedadForm.value);
  }

  editarEnfermedad(): void {
    if (this.NombreEnfermedadForm.value.nombre_enfermedad.startsWith('enfermedad-')) {
      this.router.navigate([
        'editar-enfermedad',
        this.NombreEnfermedadForm.value.nombre_enfermedad.replace('enfermedad-', ''),
      ]);
    } else {
      this.router.navigate([
        'editar-etapa-enfermedad',
        this.NombreEnfermedadForm.value.nombre_enfermedad.replace('etapa-', ''),
      ]);
    }
  }

  eliminarEnfermedad(): void {
    let enfermedad: string;
    if (this.NombreEnfermedadForm.value.nombre_enfermedad.startsWith('enfermedad-')) {
      enfermedad = this.NombreEnfermedadForm.value.nombre_enfermedad.replace('enfermedad-', '');
    } else {
      enfermedad = this.NombreEnfermedadForm.value.nombre_enfermedad.replace('etapa-', '');
    }
    Swal.fire({
      text: 'Estás seguro de eliminar la enfermedad?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
    }).then(value => {
      if (value.isConfirmed) {
        this.enfermedadesService.eliminarEnfermedad(enfermedad).subscribe(
          resp => {
            console.log(resp);
            Swal.fire({
              title: this.NombreEnfermedadForm.value.nombre_enfermedad.replace('enfermedad-', ''),
              html: 'Se eliminó correctamente la enfermedad',
              icon: 'success',
            });
            this.cargarEnfermedades();
          },
          error => {
            Swal.fire({
              title: this.NombreEnfermedadForm.value.nombre_enfermedad,
              html: error.error.message,
              icon: 'error',
            });
          }
        );
      }
    });
  }

  esValido(): boolean {
    return this.NombreEnfermedadForm.value.nombre_enfermedad != null;
  }

  private groupBy(collection: any[], property: string): any[] {
    const values: any[] = [];
    const result: any[] = [];

    for (const item of collection) {
      const value = item[property];
      const index = values.indexOf(value);

      if (index > -1) {
        result[index].push(item);
      } else {
        values.push(value);
        result.push([item]);
      }
    }

    return result;
  }
}

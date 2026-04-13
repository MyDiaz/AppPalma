import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PlagasService } from '../../Servicios/plagas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-plagas',
  templateUrl: './listado-plagas.component.html',
  styles: [],
})
export class ListadoPlagasComponent implements OnInit {
  NombrePlagaForm: FormGroup;
  plagas: any[] = [];
  cargando = false;
  hayPlagas = false;
  bandera = false;
  mensajeError = '';
  rta: any;

  constructor(private plagaService: PlagasService, private router: Router) {
    this.NombrePlagaForm = new FormGroup({
      nombre_comun_plaga: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.cargarPlagas();
  }

  cargarPlagas(): void {
    this.cargando = true;
    this.bandera = false;

    this.plagaService.getPlagas().subscribe(
      (data: any[]) => {
        this.plagas = this.groupBy(data, 'nombre_comun_plaga');
        this.cargando = false;
        this.hayPlagas = this.plagas.length > 0;
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

  esValido(): boolean {
    return this.NombrePlagaForm.value.nombre_comun_plaga != null;
  }

  eliminarPlaga(): void {
    Swal.fire({
      text: 'EstÃ¡s seguro de eliminar la plaga?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
    }).then(value => {
      if (value.isConfirmed) {
        this.plagaService
          .eliminarPlaga(this.NombrePlagaForm.value.nombre_comun_plaga)
          .subscribe(
            resp => {
              this.rta = resp;
              console.log(resp);
              Swal.fire({
                title: this.NombrePlagaForm.value.nombre_comun_plaga,
                html: this.rta.message,
                icon: 'success',
              });
              this.cargarPlagas();
            },
            error => {
              Swal.fire({
                title: this.NombrePlagaForm.value.nombre_comun_plaga,
                html: error.error.message,
                icon: 'error',
              });
            }
          );
      }
    });
  }

  editarPlaga(): void {
    this.router.navigate([
      'nueva-plaga',
      this.NombrePlagaForm.value.nombre_comun_plaga,
    ]);
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

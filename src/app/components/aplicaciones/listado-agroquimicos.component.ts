import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AgroquimicosService } from 'src/app/Servicios/agroquimicos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-agroquimicos',
  templateUrl: './listado-agroquimicos.component.html',
  styles: [],
})
export class ListadoAgroquimicosComponent implements OnInit {
  NombreAgroquimicoForm: FormGroup;
  agroquimicos: any[] = [];
  rta: any;
  bandera = false;
  cargando = false;
  mensajeError = '';
  hayProducto = false;

  constructor(
    private agroquimicosService: AgroquimicosService,
    private router: Router
  ) {
    this.cargando = true;
    this.NombreAgroquimicoForm = new FormGroup({
      id_producto_agroquimico: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.cargarAgroquimicos();
  }

  cargarAgroquimicos(): void {
    this.cargando = true;
    this.bandera = false;

    this.agroquimicosService.getAgroquimicos().subscribe(
      (data: any[]) => {
        this.agroquimicos = this.groupBy(data, 'tipo_producto_agroquimico');
        console.log('agroquimicos', this.agroquimicos);
        this.cargando = false;
        this.hayProducto = this.agroquimicos.length > 0;
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
    return this.NombreAgroquimicoForm.value.id_producto_agroquimico != null;
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

  editarAgroquimico(): void {
    this.router.navigate([
      'nuevo-agroquimico',
      this.NombreAgroquimicoForm.value.id_producto_agroquimico,
    ]);
  }

  eliminarAgroquimico(): void {
    Swal.fire({
      text: 'Estás seguro de eliminar el producto agroquí­mico?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
    }).then(value => {
      if (value.isConfirmed) {
        this.agroquimicosService
          .eliminarAgroquimico(
            this.NombreAgroquimicoForm.value.id_producto_agroquimico
          )
          .subscribe(
            resp => {
              this.rta = resp;
              console.log(resp);
              Swal.fire({
                title: this.NombreAgroquimicoForm.value.nombre_comun_plaga,
                html: this.rta.message,
                icon: 'success',
              });
              this.cargarAgroquimicos();
            },
            error => {
              Swal.fire({
                title: this.NombreAgroquimicoForm.value.nombre_comun_plaga,
                html: error.error.message,
                icon: 'error',
              });
            }
          );
      }
    });
  }
}

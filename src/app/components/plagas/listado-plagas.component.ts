import { Component, OnInit, Input } from '@angular/core';
import { PlagasService } from '../../Servicios/plagas.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-plagas',
  templateUrl: './listado-plagas.component.html',
  styles: []
})
export class ListadoPlagasComponent implements OnInit {

  NombrePlagaForm:FormGroup;
  plagas:any[] = [];
  cargando:boolean = false;
  hayPlagas:boolean = false;
  bandera:boolean = false;
  mensajeError:string;
  rta:any;

  constructor(private plagaService:PlagasService, private router:Router) { 
    this.plagaService.getPlagas().subscribe( data => {
      this.plagas = this.groupBy(data,"nombre_comun_plaga");
      this.cargando = true;
      if(this.plagas.length > 0) this.hayPlagas = true;
    }, err => {
      this.bandera = true;
      this.mensajeError = err.error.mensaje;
      console.log(err);
      if( err.status == 0 ) this.mensajeError = "Servicio no disponible"
    });

    this.NombrePlagaForm = new FormGroup({
      nombre_comun_plaga: new FormControl()
    });
  }

  ngOnInit() {
  }

  esValido(){
    return this.NombrePlagaForm.value.nombre_comun_plaga != null;
  }

  eliminarPlaga(){
    Swal.fire({
        text: 'Estás seguro de eliminar la plaga?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true
      }).then(value => {
        if (value.isConfirmed) {
          this.plagaService.eliminarPlaga(this.NombrePlagaForm.value.nombre_comun_plaga).subscribe(
            resp => {
              this.rta = resp;
              console.log(resp);
              Swal.fire({
                title: this.NombrePlagaForm.value.nombre_comun_plaga,
                html : this.rta.message,
                icon : 'success'
              });
              window.location.reload();
            },
            error => {
              Swal.fire({
                title: this.NombrePlagaForm.value.nombre_comun_plaga,
                html : error.error.message,
                icon : 'error'
              });
            })
        }
      });
  }

  editarPlaga(){
      this.router.navigate(['nueva-plaga',this.NombrePlagaForm.value.nombre_comun_plaga]);
  }

  private groupBy(collection, property){
    var i = 0, val, index,
        values = [], result = [];
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

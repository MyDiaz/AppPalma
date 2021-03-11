import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, FormControl,Validators, FormArray } from '@angular/forms';
import { AgroquimicosService } from 'src/app/Servicios/agroquimicos.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-agroquimicos',
  templateUrl: './listado-agroquimicos.component.html',
  styles: []
})
export class ListadoAgroquimicosComponent implements OnInit {
  
  NombreAgroquimicoForm:FormGroup;  

  agroquimicos:any = [];
  rta:any;
  message:string;
  bandera:boolean = false;
  cargando:boolean = false;
  mensajeError:string;
  hayProducto:boolean = false;

  constructor(private fb: FormBuilder, private agroquimicosService:AgroquimicosService, 
    private router:Router) {
    this.agroquimicosService.getAgroquimicos().subscribe( data => {
      this.agroquimicos = this.groupBy(data,"tipo_producto_agroquimico");
      console.log("agroquimicos",this.agroquimicos);
      this.cargando = false;
      if(this.agroquimicos.length > 0) this.hayProducto = true;
    }, err => {
      this.bandera = true;
      this.mensajeError = err.error.mensaje;
      console.log(err);
      if( err.status == 0 ) this.mensajeError = "Servicio no disponible"
    });
    
    this.cargando = true;

    this.NombreAgroquimicoForm = new FormGroup({
      id_producto_agroquimico: new FormControl()
    });
   }

  ngOnInit() {}

  esValido(){
    return this.NombreAgroquimicoForm.value.id_producto_agroquimico != null;
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

  editarAgroquimico(){
    this.router.navigate(['nuevo-agroquimico',this.NombreAgroquimicoForm.value.id_producto_agroquimico]);
}

  eliminarAgroquimico(){
    Swal.fire({
        text: 'Estás seguro de eliminar la plaga?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true
      }).then( () => {
        this.agroquimicosService.eliminarAgroquimico(this.NombreAgroquimicoForm.value.id_producto_agroquimico).subscribe(
          resp => {
            this.rta = resp;
            console.log(resp);
            Swal.fire({
              title: this.NombreAgroquimicoForm.value.nombre_comun_plaga,
              html : this.rta.message,
              icon : 'success'
            });
            window.location.reload();
          },(error) => {
            Swal.fire({
              title: this.NombreAgroquimicoForm.value.nombre_comun_plaga,
              html : error.error.message,
              icon : 'error'
            });
          })
      })
  }

}

import { Component } from '@angular/core';
import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';
import { LoteService } from 'src/app/Servicios/lote.service';
import { LoteModel } from '../../../models/lote.models';
import { respuesta } from '../../../models/resp.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-lote',
  templateUrl: './nuevo-lote.component.html',
  styleUrls: ['./nuevo-lote.component.css']
})
export class NuevoLoteComponent {

  /*NuevoLoteForm: FormGroup;
  Año  = new Date();
  rta = new respuesta();

  constructor(private fb: FormBuilder, private LoteService:LoteService) {
    this.NuevoLoteForm = new FormGroup({
      nombre_lote      : new FormControl(),
      año_siembra      : new FormControl(),
      hectareas        : new FormControl(),
      numero_palmas    : new FormControl(),
      material_siembra : new FormControl(), 
   });
   this.crearFormulario();
   }

  get nombreLoteNoValido() {
    return this.NuevoLoteForm.get('nombre_lote').invalid && this.NuevoLoteForm.get('nombre_lote').touched
  }

  get AnoSiembraNoValido() {
    return this.NuevoLoteForm.get('año_siembra').invalid && this.NuevoLoteForm.get('año_siembra').touched    
  } 

  get HectareasNoValido() {
    return this.NuevoLoteForm.get('hectareas').invalid && this.NuevoLoteForm.get('hectareas').touched    
  }

  get NumeroPalmasNoValido(){
    return this.NuevoLoteForm.get('numero_palmas').invalid && this.NuevoLoteForm.get('numero_palmas').touched    
  }

  get MaterialSiembraNoValido(){
    return this.NuevoLoteForm.get('material_siembra').invalid && this.NuevoLoteForm.get('material_siembra').touched    
  }
  
  crearFormulario() {
    this.NuevoLoteForm = this.fb.group({
      nombre_lote     : ['lote3', [ Validators.required, Validators.minLength(5) ]],
      año_siembra     : [`${this.Año.getFullYear()}`, [ Validators.required, Validators.minLength(4), Validators.min(0) ]],
      hectareas       : ['12', [ Validators.required ]],
      numero_palmas   : ['1234', [ Validators.required ]],
      material_siembra: ['1', [ Validators.required ]]
    }); 
  }

  guardar() {
    console.log("valor", this.NuevoLoteForm.value);
    let nuevoLote = {
      nombre_lote     : encodeURIComponent(this.NuevoLoteForm.value),
      año_siembra     : this.NuevoLoteForm.value.año_siembra,
      hectareas       : this.NuevoLoteForm.value.hectareas,
      numero_palmas   : this.NuevoLoteForm.value.numero_palmas,
      material_siembra: encodeURIComponent(this.NuevoLoteForm.value.material_siembra)
    };
        Swal.fire({
          text: 'Estás seguro de agregarlo?',
          icon: 'question',
          showCancelButton: true,
          showConfirmButton: true
        }).then( a => {
          this.LoteService.postLote(nuevoLote).subscribe(
            resp => {
              this.rta = resp;
              Swal.fire({
                title: nuevoLote.nombre_lote,
                text: this.rta.message,
                icon: 'success'
              });
            }, (err) => {
              Swal.fire({
                icon: 'error',
                title: 'Error al crear lote',
                text: 'err.error.error.message'
              });          
            });
          });
     this.NuevoLoteForm.reset({});
  }*/
}

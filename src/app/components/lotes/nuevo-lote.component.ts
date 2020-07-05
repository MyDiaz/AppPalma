import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';
import { LoteService } from 'src/app/Servicios/lote.service';
import { LoteModel } from '../../models/lote.models';
import { respuesta } from '../../models/resp.model';

import Swal from 'sweetalert2';
import { title } from 'process';

@Component({
  selector: 'app-nuevo-lote',
  templateUrl: './nuevo-lote.component.html',
  styleUrls: ['./nuevo-lote.component.css']
})
export class NuevoLoteComponent implements OnInit {

  NuevoLoteForm: FormGroup;
  Año  = new Date();
  Lote = new LoteModel();
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

  ngOnInit() {
    //$('button').click(function(){
  
      
      
    //})
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
    this.Lote = this.NuevoLoteForm.value;
        
        Swal.fire({
          text: 'Estás seguro de agregarlo?',
          icon: 'question',
          showCancelButton: true,
          showConfirmButton: true
        }).then( a => {
          
          this.LoteService.postLote(this.Lote).subscribe(
            resp => {
              this.rta = resp;
              Swal.fire({
                title: this.Lote.nombre_lote,
                text: this.rta.message,
                icon: 'success'
              });
            });
          });
     this.NuevoLoteForm.reset({});
  }

}

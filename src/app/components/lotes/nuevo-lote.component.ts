import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-nuevo-lote',
  templateUrl: './nuevo-lote.component.html',
  styleUrls: ['./nuevo-lote.component.css']
})
export class NuevoLoteComponent implements OnInit {

  NuevoLoteForm: FormGroup;

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
  
  constructor(private fb: FormBuilder) {
    this.NuevoLoteForm = new FormGroup({
      nombre_lote      : new FormControl(),
      año_siembra      : new FormControl(),
      hectareas        : new FormControl(),
      numero_palmas    : new FormControl(),
      material_siembra : new FormControl(), 
   });
   this.crearFormulario();
   }

  ngOnInit() {

  }
  
  crearFormulario() {
    this.NuevoLoteForm = this.fb.group({
      nombre_lote     : ['', [ Validators.required, Validators.minLength(5) ]],
      año_siembra     : ['', [ Validators.required, Validators.minLength(4) ]],
      hectareas       : ['', [ Validators.required ]],
      numero_palmas   :    ['', [ Validators.required ]],
      material_siembra: ['', [ Validators.required ]]
    }); 
  }

  guardar() {
    console.log( this.NuevoLoteForm );

    
  }

}

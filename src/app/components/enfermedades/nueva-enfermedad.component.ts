import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl,FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-nueva-enfermedad',
  templateUrl: './nueva-enfermedad.component.html',
  styles: []
})
export class NuevaEnfermedadComponent implements OnInit {
  
  NuevaEnfermedadForm: FormGroup;
  etapas:string[] = [];
  etapa:string;
  bandera:boolean = false;

  constructor(private fb: FormBuilder) { 
    this.NuevaEnfermedadForm = new FormGroup({
      nombre_enfermedad : new FormControl(),
      etapas_enfermedad : this.fb.array([])
    });
    this.crearFormulario();
  }

  get nombreEnfermedadNoValido() {
    return this.NuevaEnfermedadForm.get('nombre_enfermedad').invalid && this.NuevaEnfermedadForm.get('nombre_enfermedad').touched;
  }
  
  get etapasEnfermedad() {
    return this.NuevaEnfermedadForm.get('etapas_enfermedad') as FormArray;
  }

  ngOnInit() {
  }
  
  crearFormulario(){
    this.NuevaEnfermedadForm= this.fb.group({
      nombre_enfermedad: ['', [Validators.required, Validators.minLength(3)] ],
      etapas_enfermedad: this.fb.array([])
      
    });
  }
  
  addEtapa () {
      this.etapasEnfermedad.push( this.fb.control('') );
  }

guardar(){
  console.log("valor", this.NuevaEnfermedadForm.value);
  console.log("estado", this.NuevaEnfermedadForm.status);
}
  
  
  
}

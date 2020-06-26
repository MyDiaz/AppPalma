import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-nueva-enfermedad',
  templateUrl: './nueva-enfermedad.component.html',
  styles: []
})
export class NuevaEnfermedadComponent implements OnInit {
  
  NuevaEnfermedadForm: FormGroup;

  bandera:boolean = false;

  constructor(private fb: FormBuilder) { 
    this.NuevaEnfermedadForm = new FormGroup({
      nombre_enfermedad: new FormControl(),
      etapa_enfermedad : new FormControl()
    });

  }

  nombreEnfermedadNoValido() {
    return this.NuevaEnfermedadForm.get('nombre_enfermedad').invalid && this.NuevaEnfermedadForm.get('nombre_enfermedad').touched;s
  }
  ngOnInit() {
  }
  
  crearFormulario(){
    this.NuevaEnfermedadForm= this.fb.group({
      nombre_enfermedad: ['',[ Validators.required, Validators.minLength(3)] ]
    });
  }
  






  

  
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl,FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-enfermedad',
  templateUrl: './editar-enfermedad.component.html',
  styleUrls: ['./editar-enfermedad.component.css']
})
export class EditarEnfermedadComponent implements OnInit {

  editaEnfermedadForm: FormGroup;
  param_enfermedad:string;
  enfermedad:any = {};

  constructor(private fb: FormBuilder, private router:Router, private activatedRoute:ActivatedRoute,
    private enfermedadesService:EnfermedadesService) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.param_enfermedad = params.get('nombre_enfermedad');
    });
    this.crearEditaEnfermedadForm();
    this.enfermedadesService.getEnfermedad(this.param_enfermedad).subscribe( data => {
      this.enfermedad = data;
      //console.log(this.enfermedad, this.param_enfermedad);
      this.crearEditaEnfermedadForm();
    })
    
  }
  
  ngOnInit() {
    
  }

  crearEditaEnfermedadForm(){
    this.editaEnfermedadForm = this.fb.group({
      nombre_enfermedad                   : [ this.enfermedad.nombre_enfermedad, [Validators.required, Validators.minLength(3)] ],
      procedimiento_tratamiento_enfermedad: [ this.enfermedad.procedimiento_tratamiento_enfermedad, [Validators.required, Validators.minLength(10)] ]
    })
  }
//encodeURIComponent
  guardar(){
    let data = {
      nombre_enfermedad: encodeURIComponent(this.editaEnfermedadForm.value.nombre_enfermedad),
      procedimiento_tratamiento_enfermedad: encodeURIComponent(this.editaEnfermedadForm.value.procedimiento_tratamiento_enfermedad)
    }
    Swal.fire({
      text: 'Estás seguro de agregarlo?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true}).then( () => {
      this.enfermedadesService.putEnfermedad(data, encodeURIComponent(this.param_enfermedad)).subscribe(
        resp => {
          Swal.fire({
            title: this.param_enfermedad,
            html: resp.message,
            icon: 'success'
          });
          //this.editaEnfermedadForm.reset({});
          this.router.navigateByUrl('listado-enfermedad');
        }, (error) => {
          Swal.fire({
            title: this.editaEnfermedadForm.value.nombre_lote,
            html: error.message,
            icon: 'error'
          });
        });
      })
    }

}

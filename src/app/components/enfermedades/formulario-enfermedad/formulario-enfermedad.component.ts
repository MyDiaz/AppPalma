import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, Validators, FormArray } from '@angular/forms';
import { EnfermedadesService } from 'src/app/Servicios/enfermedades.service';
import Swal from 'sweetalert2';
import { respuesta } from '../../../models/resp.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario-enfermedad',
  templateUrl: './formulario-enfermedad.component.html',
  styles: []
})
export class FormularioEnfermedadComponent implements OnInit {
  
  NuevaEnfermedadEtapasForm: FormGroup;
  NuevaEnfermedadForm: FormGroup;
  bandera:boolean = false;
  rta = new respuesta();
  hayEtapas:boolean = false;
  noEtapas:boolean = false;

  constructor(private fb: FormBuilder, private enfermedadService:EnfermedadesService, 
    private router:Router) { 
      this.crearFormularioEnfermedadEtapas();
      this.crearFormularioEnfermedad();
  }

  //  VALIDACIONES PARA ENFERMEDAD CON ETAPAS
  get nombreEnfermedadEtapasNoValido() {
    return this.NuevaEnfermedadEtapasForm.get('nombre_enfermedad').invalid && this.NuevaEnfermedadEtapasForm.get('nombre_enfermedad').touched;
  }
  
  get etapasEnfermedad() {
    return this.NuevaEnfermedadEtapasForm.get('etapas_enfermedad') as FormArray;
  }
  
  get TratamientoEtapaEnfermedad() {
    return this.NuevaEnfermedadEtapasForm.get('tratamiento_etapa_enfermedad') as FormArray;
  }

  // VALIDACIONES PARA ENFERMEDAD SIN ETAPAS
  get nombreEnfermedadNoValido(){
    return this.NuevaEnfermedadForm.get('nombre_enfermedad').invalid && this.NuevaEnfermedadForm.get('nombre_enfermedad').touched;
  }

  get ProcedimientoTratamientoEnfermedadNoValido() {
    return this.NuevaEnfermedadForm.get('procedimiento_tratamiento_enfermedad').invalid && this.NuevaEnfermedadForm.get('procedimiento_tratamiento_enfermedad').touched;
  }

  ngOnInit() {
  }
  
  crearFormularioEnfermedadEtapas(){
    this.NuevaEnfermedadEtapasForm= this.fb.group({
      nombre_enfermedad          : [, [Validators.required, Validators.minLength(3)]],
      etapas_enfermedad           : this.fb.array(['']),
      tratamiento_etapa_enfermedad: this.fb.array([''])
    });
  }

  crearFormularioEnfermedad(){
    this.NuevaEnfermedadForm = this.fb.group({
      nombre_enfermedad                   : [, [Validators.required, Validators.minLength(3)] ],
      procedimiento_tratamiento_enfermedad: [, [Validators.required, Validators.minLength(10)] ]
    })
  }
  
  //PARA AÑADIR LAS ETAPAS AL ARRAY 
  addEtapa () {
      this.etapasEnfermedad.push( this.fb.control('') );
  }
  
  addTratamientoEtapa () {
    this.TratamientoEtapaEnfermedad.push( this.fb.control('') );
  }

  borrarFila(){
    let i = this.etapasEnfermedad.length - 1;
    console.log("i" ,i);
    if( i != 0 ){
      this.etapasEnfermedad.removeAt(i);
      this.TratamientoEtapaEnfermedad.removeAt(i);
    }
  }

  guardarEnfermedadEtapas()
    { 
      let valores_etapas_enfermedad = {
        nombre_enfermedad: encodeURIComponent(this.NuevaEnfermedadEtapasForm.value.nombre_enfermedad),
        etapas_enfermedad: this.NuevaEnfermedadEtapasForm.value.etapas_enfermedad.map( etapas => { 
          return encodeURIComponent(etapas)
        }),
        tratamiento_etapa_enfermedad: this.NuevaEnfermedadEtapasForm.value.tratamiento_etapa_enfermedad.map( tratamieto => { 
          return encodeURIComponent(tratamieto)
        })
      }
      console.log(valores_etapas_enfermedad);
      Swal.fire({
        text: 'Estás seguro de agregarlo?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true
      }).then( (value) => {
        if(value.isConfirmed){
          this.enfermedadService.postEnfermedadEtapas(valores_etapas_enfermedad).subscribe(
          resp => {
            this.rta = resp;
            Swal.fire({
              title: decodeURIComponent(valores_etapas_enfermedad.nombre_enfermedad),
              html: this.rta.message,
              icon: 'success'
            });
            this.NuevaEnfermedadEtapasForm.reset({});
            this.router.navigateByUrl('listado-enfermedad');
          },(error) => {
            Swal.fire({
              title: decodeURIComponent(valores_etapas_enfermedad.nombre_enfermedad),
              html: error.error.message,
              icon: 'error'
            });
          })
        }
      })  
    }

    guardarEnfermedad(){
      let valores_enfermedad = {
        nombre_enfermedad: encodeURIComponent(this.NuevaEnfermedadForm.value.nombre_enfermedad),
        procedimiento_tratamiento_enfermedad: encodeURIComponent(this.NuevaEnfermedadForm.value.procedimiento_tratamiento_enfermedad)
      }
      console.log(valores_enfermedad);
      Swal.fire({
        text: 'Estás seguro de agregarlo?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true
      }).then( (value) => {
          if(value.isConfirmed){
            this.enfermedadService.postEnfermedad(valores_enfermedad).subscribe(
              resp => {
                this.rta = resp;
                Swal.fire({
                  title: this.NuevaEnfermedadForm.value.nombre_enfermedad,
                  html: this.rta.message,
                  icon: 'success'
                });
                this.NuevaEnfermedadForm.reset({});
                this.router.navigateByUrl('listado-enfermedad');
              },(error) => {
                Swal.fire({
                  title: this.NuevaEnfermedadForm.value.nombre_enfermedad,
                  html: error.error.message,
                  icon: 'error'
                });
              }
            )  
          }
      })  
    }

    regresar(){
      this.router.navigateByUrl(`listado-enfermedad`);
    }
}
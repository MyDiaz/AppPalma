import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl,FormBuilder, Validators, FormArray } from '@angular/forms';
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
  enfermedadEtapas:any;
  enfermedad:any;
  rta = new respuesta();
  hayEtapas:boolean = false;

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
      etapas_enfermedad           : this.fb.array([]),
      tratamiento_etapa_enfermedad: this.fb.array([])
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

  guardarEnfermedadEtapas()
    {
      this.enfermedadEtapas = this.NuevaEnfermedadEtapasForm.value;
      console.log(this.enfermedadEtapas);
      Swal.fire({
        text: 'Estás seguro de agregarlo?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true
      }).then( () => {
        this.enfermedadService.postEnfermedadEtapas(this.enfermedadEtapas).subscribe(
          resp => {
            this.rta = resp;
            Swal.fire({
              title: this.enfermedadEtapas.nombre_enfermedad,
              html: this.rta.message,
              icon: 'success'
            });
            this.NuevaEnfermedadEtapasForm.reset({});
            this.router.navigateByUrl('listado-enfermedad');
          },(error) => {
            Swal.fire({
              title: this.enfermedadEtapas.nombre_enfermedad,
              html: error.error.message,
              icon: 'error'
            });
          })
      })  
    }

    guardarEnfermedad(){
      this.enfermedad = this.NuevaEnfermedadForm.value;
      console.log(this.enfermedad);
      Swal.fire({
        text: 'Estás seguro de agregarlo?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true
      }).then( () => {
        this.enfermedadService.postEnfermedad(this.enfermedad).subscribe(
          resp => {
            this.rta = resp;
            Swal.fire({
              title: this.enfermedad.nombre_enfermedad,
              html: this.rta.message,
              icon: 'success'
            });
            this.NuevaEnfermedadForm.reset({});
            this.router.navigateByUrl('listado-enfermedad');
          },(error) => {
            Swal.fire({
              title: this.enfermedad.nombre_enfermedad,
              html: error.error.message,
              icon: 'error'
            });
          })
      })  
    }

    regresar(){
      this.router.navigateByUrl(`listado-enfermedad`);
    }
}
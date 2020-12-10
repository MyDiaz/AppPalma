import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, Validators, FormArray } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { PlagasService } from '../../Servicios/plagas.service'

@Component({
  selector: 'app-nueva-plaga',
  templateUrl: './nueva-plaga.component.html',
  styles: []
})
export class NuevaPlagaComponent implements OnInit {

  NuevaPlagaForm: FormGroup;
  bandera:boolean = false; //hubo error en el  servidor 
  cargando:boolean = false;
  mensajeError:string;
  nombrePlaga:string;
  plagaEditar: any = [];
  hayPlaga:boolean = false;

  constructor(private fb: FormBuilder, private router:Router, private plagasService:PlagasService, private activatedRoute:ActivatedRoute) {
    this.crearFormularioPlagas();

    this.activatedRoute.paramMap.subscribe(params => {
      this.nombrePlaga = params.get('nombre_comun_plaga');
      if(this.nombrePlaga) this.hayPlaga = true;
    });
    this.plagasService.getPlaga(this.nombrePlaga).subscribe(
      data => { 
        this.plagaEditar = data;
        this.cargando = true;
        this.crearFormularioPlagas();
      },
      error => {
        this.bandera = true;
        this.mensajeError =  error;
      });
   }

  ngOnInit() {}

  crearFormularioPlagas(){
    if(this.nombrePlaga){
      //actualizar
      this.NuevaPlagaForm = this.fb.group({
        ids_etapas_plaga            : this.fb.array(this.plagaEditar.map(a => a.id_etapa_plaga)),
        nombre_comun_plaga          : [`${this.nombrePlaga}`, [Validators.required, Validators.minLength(3)]],
        nombre_etapa_plaga          : this.fb.array(this.plagaEditar.map(a => a.nombre_etapa_plaga)),
        procedimiento_etapa_plaga   : this.fb.array(this.plagaEditar.map(a => a.procedimiento_etapa_plaga))
      });
    }else{
      //crear
      this.NuevaPlagaForm = this.fb.group({
        nombre_comun_plaga          : [, [Validators.required, Validators.minLength(3)]],
        nombre_etapa_plaga          : this.fb.array(['']),
        procedimiento_etapa_plaga   : this.fb.array([''])
      });
    }
    
  }

  //  VALIDACIONES
  get nombreEnfermedadEtapasNoValido() {
    return this.NuevaPlagaForm.get('nombre_comun_plaga').invalid && this.NuevaPlagaForm.get('nombre_comun_plaga').touched;
  }
  
  get IDsPlaga() {
    return this.NuevaPlagaForm.get('ids_etapas_plaga') as FormArray;
  }

  get etapasPlaga() {
    return this.NuevaPlagaForm.get('nombre_etapa_plaga') as FormArray;
  }
  
  get ProcedimientoEtapasPlaga() {
    return this.NuevaPlagaForm.get('procedimiento_etapa_plaga') as FormArray;
  }

  guardarPlaga(){
    console.log("this.NuevaPlagaForm.value", this.NuevaPlagaForm.value);
    let valores_etapas_plaga = {
      nombre_comun_plaga: encodeURIComponent(this.NuevaPlagaForm.value.nombre_comun_plaga),
      nombre_etapa_plaga: this.NuevaPlagaForm.value.nombre_etapa_plaga.map( etapas => { 
        return encodeURIComponent(etapas)
      }),
      procedimiento_etapa_plaga: this.NuevaPlagaForm.value.procedimiento_etapa_plaga.map( tratamieto => { 
        return encodeURIComponent(tratamieto)
      })
    }
    console.log("valores_etapas_plaga",valores_etapas_plaga);
    Swal.fire({
      text: 'Estás seguro de agregar la plaga?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true
    }).then( () => {
  
        this.plagasService.postPlaga(valores_etapas_plaga).subscribe(
        resp => {
          let rta = resp;
          Swal.fire({
            title: decodeURIComponent(valores_etapas_plaga.nombre_comun_plaga),
            html: rta.message,
            icon: 'success'
          });
          this.NuevaPlagaForm.reset({});
          this.router.navigateByUrl('listado-plagas');
        },(error) => {
          Swal.fire({
            title: decodeURIComponent(valores_etapas_plaga.nombre_comun_plaga),
            html: error.error.message,
            icon: 'error'
          });
        })
    })  
  }

  actualizarPlaga() {
    let valores_etapas_plaga = {
      ids_etapas_plaga: this.NuevaPlagaForm.value.ids_etapas_plaga.map( ids => { 
        return ids
      }), 
      nombre_comun_plaga: encodeURIComponent(this.NuevaPlagaForm.value.nombre_comun_plaga),
      nombre_etapa_plaga: this.NuevaPlagaForm.value.nombre_etapa_plaga.map( etapas => { 
        return encodeURIComponent(etapas)
      }),
      procedimiento_etapa_plaga: this.NuevaPlagaForm.value.procedimiento_etapa_plaga.map( tratamieto => { 
        return encodeURIComponent(tratamieto)
      })
    }
    Swal.fire({
      text: 'Estás seguro de agregar la plaga?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true
    }).then( () => {
      this.plagasService.postPlaga(valores_etapas_plaga).subscribe(
        resp => {
          let rta = resp;
          Swal.fire({
            title: decodeURIComponent(valores_etapas_plaga.nombre_comun_plaga),
            html: rta.message,
            icon: 'success'
          });
          this.NuevaPlagaForm.reset({});
          this.router.navigateByUrl('listado-plagas');
        },(error) => {
          Swal.fire({
            title: decodeURIComponent(valores_etapas_plaga.nombre_comun_plaga),
            html: error.error.message,
            icon: 'error'
          });
        }
      )}
    )}
  
    //PARA AÑADIR LAS ETAPAS AL ARRAY 
    addEtapa() {
      this.etapasPlaga.push( this.fb.control('') );
    }

    addProcedimientoEtapa() {
      this.ProcedimientoEtapasPlaga.push( this.fb.control('') );
    }

    addID() {
      if(this.nombrePlaga) {
        this.IDsPlaga.push( this.fb.control(-1) )
      }
    }

    borrarFila(){
      let i = this.etapasPlaga.length - 1;
      if( i != 0 ){
        this.etapasPlaga.removeAt(i);
        this.ProcedimientoEtapasPlaga.removeAt(i);
        this.IDsPlaga.removeAt(i);
      }
  
}

regresar(){
  this.router.navigateByUrl('listado-plagas');
}

 

}

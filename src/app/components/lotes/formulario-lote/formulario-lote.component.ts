import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router'
import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';
import { LoteService } from 'src/app/Servicios/lote.service';
import { LoteModel } from '../../../models/lote.models';
import { respuesta } from '../../../models/resp.model';

//libreria para mensajes emergentes
import Swal from 'sweetalert2';


@Component({
  selector: 'app-formulario-lote',
  templateUrl: './formulario-lote.component.html',
  styleUrls: ['./formulario-lote.component.css']
})
export class FormularioLoteComponent implements OnInit {

  NuevoLoteForm: FormGroup;
  Año  = new Date();
  lote_res = new LoteModel();
  lote_req = new LoteModel();
  rta = new respuesta();


  //comunicacion con el componente padre
  @Input() id_lote:string;

  constructor(private fb: FormBuilder, private LoteService:LoteService, private router:Router) {
      this.NuevoLoteForm = new FormGroup({
        nombre_lote      : new FormControl(),
        año_siembra      : new FormControl(),
        hectareas        : new FormControl(),
        numero_palmas    : new FormControl(),
        material_siembra : new FormControl(), 
     });
   }

   ngOnInit() {
    this.LoteService.getLote(this.id_lote).subscribe(
      data => { 
        this.lote_res = data;
        this.crearFormulario();
      },
      error => {
        console.log("error en lote", error);
      });
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
    if( this.id_lote ) {
      this.NuevoLoteForm = this.fb.group({
        nombre_lote     : [`${this.lote_res.nombre_lote}`, [ Validators.required, Validators.minLength(5) ]],
        año_siembra     : [`${this.lote_res.año_siembra}`, [ Validators.required, Validators.minLength(4), Validators.min(0) ]],
        hectareas       : [`${this.lote_res.hectareas}`, [ Validators.required ]],
        numero_palmas   : [`${this.lote_res.numero_palmas}`, [ Validators.required ]],
        material_siembra: [`${this.lote_res.material_siembra}`, [ Validators.required ]]
      });
    }else{
      this.NuevoLoteForm = this.fb.group({
        nombre_lote     : [ , [ Validators.required, Validators.minLength(5) ]],
        año_siembra     : [`${this.Año.getFullYear()}`, [ Validators.required, Validators.minLength(4), Validators.min(0) ]],
        hectareas       : [ , [ Validators.required ]],
        numero_palmas   : [ , [ Validators.required ]],
        material_siembra: [ , [ Validators.required ]]
      });
    } 
  }
  
  guardar() {
    console.log("valor", this.NuevoLoteForm.value);
    this.lote_req = this.NuevoLoteForm.value;
    //AGREGAR LOTE    
    Swal.fire({
      text: 'Estás seguro de agregarlo?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true}).then( () => {
      if ( !this.id_lote){
        this.LoteService.postLote(this.lote_req).subscribe(
          resp => {
            this.rta = resp;
            Swal.fire({
              title: this.lote_req.nombre_lote,
              html: this.rta.message,
              icon: 'success'
            });
            this.NuevoLoteForm.reset({});
          }, (error) => {
            Swal.fire({
              title: this.lote_req.nombre_lote,
              html: error.error.message,
              icon: 'error'
            });
          });
      } else {
      //ACTUALIZAR LOTE  
        this.LoteService.putLote(this.lote_req, this.id_lote,).subscribe(
          resp => {
            this.rta = resp;
            Swal.fire({
              title: this.lote_req.nombre_lote,
              html: this.rta.message,
              icon: 'success'
            }).then( () => {
              this.router.navigateByUrl(`lote/${this.lote_req.nombre_lote}`) 
            })
        }, error => {
          console.log('error put', error);
          Swal.fire({
            title: this.lote_req.nombre_lote,
            html: error.error.message,
            icon: 'error'
          })
        });
      }
    });
  }

  regresar( ) {
    if( this.id_lote ){
      this.router.navigateByUrl(`lote/${this.id_lote}`)
    }else{
      this.router.navigateByUrl('lotes')
    }
  }

}

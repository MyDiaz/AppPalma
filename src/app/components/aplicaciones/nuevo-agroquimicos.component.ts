import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, Validators, FormArray } from '@angular/forms';
import { AgroquimicosService } from 'src/app/Servicios/agroquimicos.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-nuevo-agroquimicos',
  templateUrl: './nuevo-agroquimicos.component.html',
  styles: []
})
export class NuevoAgroquimicosComponent implements OnInit {

  agroquimicoForm: FormGroup;
  rta:any;
  IDAgroquimico: string;
  mensajeError: string;
  hayProducto:boolean = false;
  cargando:boolean = false;
  bandera:boolean = false;
  agroquimicoAEditar:any = [];

  constructor(private fb: FormBuilder, private agroquimicosService:AgroquimicosService, 
    private router:Router, private activatedRoute:ActivatedRoute) { 
      this.crearFormularioAgroquímicos();

      this.activatedRoute.paramMap.subscribe(params => {
        this.IDAgroquimico = params.get('id_producto_agroquimico');
        if(this.IDAgroquimico) this.hayProducto = true;
      });
      this.agroquimicosService.getAgroquimico(this.IDAgroquimico).subscribe(
        data => { 
          this.agroquimicoAEditar = data;
          console.log(this.agroquimicoAEditar);
          this.cargando = true;
          this.crearFormularioAgroquímicos();
        },
        error => {
          this.bandera = true;
          this.mensajeError =  error;
        });
    }

  ngOnInit() {}

  crearFormularioAgroquímicos(){
    if(this.IDAgroquimico){
      this.agroquimicoForm= this.fb.group({
        nombre_producto_agroquimico            :[`${this.agroquimicoAEditar.nombre_producto_agroquimico}`, [Validators.required, Validators.minLength(3)]],
        tipo_producto_agroquimico              :[`${this.agroquimicoAEditar.tipo_producto_agroquimico}`, [Validators.required, Validators.minLength(3)]],
        clase_producto                         :[`${this.agroquimicoAEditar.clase_producto}`, [Validators.required, Validators.minLength(3)]],
        presentacion_producto_agroquimico      :[`${this.agroquimicoAEditar.presentacion_producto_agroquimico}`, [Validators.required]],
        ingrediente_activo_producto_agroquimico:[`${this.agroquimicoAEditar.ingrediente_activo_producto_agroquimico}`, [Validators.required, Validators.minLength(3)]],
        periodo_carencia_producto_agroquimico  :[`${this.agroquimicoAEditar.periodo_carencia_producto_agroquimico}`, [Validators.required]] 
      });
    }else{
      this.agroquimicoForm= this.fb.group({
      nombre_producto_agroquimico            :[, [Validators.required, Validators.minLength(3)]],
      tipo_producto_agroquimico              :[, [Validators.required, Validators.minLength(3)]],
      clase_producto                         :[, [Validators.required, Validators.minLength(3)]],
      presentacion_producto_agroquimico      :[, [Validators.required]],
      ingrediente_activo_producto_agroquimico:[, [Validators.required, Validators.minLength(3)]],
      periodo_carencia_producto_agroquimico  :[, [Validators.required]] 
    });
    }
  }

  get nombreProductoAgroquimicoNoValido() {
    return this.agroquimicoForm.get('nombre_producto_agroquimico').invalid && this.agroquimicoForm.get('nombre_producto_agroquimico').touched;
  }

  get tipoProductoAgroquimicoNoValido() {
    return this.agroquimicoForm.get('tipo_producto_agroquimico').invalid && this.agroquimicoForm.get('tipo_producto_agroquimico').touched;
  }

  get claseProductoNoValido() {
    return this.agroquimicoForm.get('clase_producto').invalid && this.agroquimicoForm.get('clase_producto').touched;
  }

  get presentacionProductoAgroquimicoNoValido() {
    return this.agroquimicoForm.get('presentacion_producto_agroquimico').invalid && this.agroquimicoForm.get('presentacion_producto_agroquimico').touched;
  }

  get ingredienteActivoProductoAgroquimicoNoValido() {
    return this.agroquimicoForm.get('ingrediente_activo_producto_agroquimico').invalid && this.agroquimicoForm.get('ingrediente_activo_producto_agroquimico').touched;
  }

  get periodoCarenciaProductoAgroquimicoNoValido() {
    return this.agroquimicoForm.get('periodo_carencia_producto_agroquimico').invalid && this.agroquimicoForm.get('periodo_carencia_producto_agroquimico').touched;
  }

  guardar(){
    console.log(this.agroquimicoForm.value);
    let valoresAgroquimico = {
      nombre_producto_agroquimico: encodeURIComponent(this.agroquimicoForm.value.nombre_producto_agroquimico),
      tipo_producto_agroquimico: encodeURIComponent(this.agroquimicoForm.value.tipo_producto_agroquimico),
      clase_producto: encodeURIComponent(this.agroquimicoForm.value.clase_producto),
      presentacion_producto_agroquimico: encodeURIComponent(this.agroquimicoForm.value.presentacion_producto_agroquimico),
      ingrediente_activo_producto_agroquimico: encodeURIComponent(this.agroquimicoForm.value.ingrediente_activo_producto_agroquimico),
      periodo_carencia_producto_agroquimico: this.agroquimicoForm.value.periodo_carencia_producto_agroquimico
    }
    console.log(valoresAgroquimico);
    Swal.fire({
      text: 'Estás seguro de agregarlo?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true
    }).then( () => {
      this.agroquimicosService.postAgroquimico(valoresAgroquimico).subscribe(
        resp => {
          this.rta = resp;
          Swal.fire({
            title: this.agroquimicoForm.value.nombre_producto_agroquimico,
            html: this.rta.message,
            icon: 'success'
          });
          this.agroquimicoForm.reset({});
          this.router.navigateByUrl('listado-agroquimicos');
        },(error) => {
          Swal.fire({
            title: this.agroquimicoForm.value.nombre_producto_agroquimico,
            html: error.error.message,
            icon: 'error'
          });
        })
    })  
  }

  actualizarProducto() {
    let valoresNuevosAgroquimico = {
      nombre_producto_agroquimico: encodeURIComponent(this.agroquimicoForm.value.nombre_producto_agroquimico),
      tipo_producto_agroquimico: encodeURIComponent(this.agroquimicoForm.value.tipo_producto_agroquimico),
      clase_producto: encodeURIComponent(this.agroquimicoForm.value.clase_producto),
      presentacion_producto_agroquimico: encodeURIComponent(this.agroquimicoForm.value.presentacion_producto_agroquimico),
      ingrediente_activo_producto_agroquimico: encodeURIComponent(this.agroquimicoForm.value.ingrediente_activo_producto_agroquimico),
      periodo_carencia_producto_agroquimico: this.agroquimicoForm.value.periodo_carencia_producto_agroquimico
    }
    console.log("valoresNuevosAgroquimico", valoresNuevosAgroquimico);
    Swal.fire({
      text: 'Estás seguro de actualizar el agroquímico?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true
    }).then( () => {
      this.agroquimicosService.actualizarAgroquimico(this.IDAgroquimico, valoresNuevosAgroquimico).subscribe(
        resp => {
          let rta = resp;
          Swal.fire({
            title: decodeURIComponent(valoresNuevosAgroquimico.nombre_producto_agroquimico),
            html: rta.message,
            icon: 'success'
          });
          this.router.navigateByUrl('listado-agroquimicos');
        },(error) => {
          Swal.fire({
            title: decodeURIComponent(valoresNuevosAgroquimico.nombre_producto_agroquimico),
            html: error.error.message,
            icon: 'error'
          });
        }
      )}
    )
  }


  regresar(){
    this.router.navigateByUrl(`listado-agroquimicos`);
  }

}

import { Component, OnInit } from '@angular/core';
import { UsuarioModel } from 'src/app/models/usuario.models';
import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/Servicios/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  
  NuevoUserForm: FormGroup;
  usuario: UsuarioModel;
  recuerdame = false;

  constructor(private fb: FormBuilder, private auth: AuthService, 
    private router:Router) { 
      this.NuevoUserForm = new FormGroup({
        cc_usuario         : new FormControl(),
        nombre_usuario     : new FormControl(),
        rol                : new FormControl(),
        cargo              : new FormControl(),
        contrasena_usuario : new FormControl(), 
     });
    }

  ngOnInit( ) { 
    this.usuario = new UsuarioModel();
    this.crearFormulario();
  }
  
  get ccUsuarioNoValido() {
    return this.NuevoUserForm.get('cc_usuario').invalid && this.NuevoUserForm.get('cc_usuario').touched
  }

  get nombreUsuarioNoValido() {
    return this.NuevoUserForm.get('nombre_usuario').invalid && this.NuevoUserForm.get('nombre_usuario').touched
  }

  get cargoNoValido() {
    return this.NuevoUserForm.get('cargo').invalid && this.NuevoUserForm.get('cargo').touched
  }

  get contrasenaUsuarioNoValido() {
    return this.NuevoUserForm.get('contrasena_usuario').invalid && this.NuevoUserForm.get('contrasena_usuario').touched
  }
  
  crearFormulario() {
    this.NuevoUserForm = this.fb.group({
      cc_usuario        : [ , [ Validators.required, Validators.minLength(7)]],
      nombre_usuario    : [ , [ Validators.required, Validators.minLength(7)]],
      rol               : [ , [ ] ],
      cargo             : [ , [ Validators.required]],
      contrasena_usuario: [ , [ Validators.required, Validators.minLength(8)]],
    })
  }
  
  guardar(){
    this.usuario = this.NuevoUserForm.value; 
    
    if( this.NuevoUserForm.invalid ){ return; }
    else{
      Swal.fire({
        text: 'Estás seguro de agregarlo?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true}).then( () => {
          this.auth.registrarUsuario(this.usuario).subscribe(
            resp => { resp;
              Swal.fire({
                title: this.usuario.nombre_usuario,
                html: resp.message,
                icon: 'success'
              });
            }, (error) => {
              Swal.fire({
                title: this.usuario.nombre_usuario,
                html: error.error.message,
                icon: 'error'
              });
            }     
          )}
        )}
  }
}

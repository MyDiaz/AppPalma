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
      this.crearFormulario();
    }

  ngOnInit( ) { 
    this.usuario = new UsuarioModel();
    
  }
  
  get ccUsuarioNoValido() {
    return this.NuevoUserForm.get('cc_usuario').invalid && this.NuevoUserForm.get('cc_usuario').touched
  }

  get nombreUsuarioNoValido() {
    return this.NuevoUserForm.get('nombre_usuario').invalid && this.NuevoUserForm.get('nombre_usuario').touched
  }

  get cargoNoValido() {
    return this.NuevoUserForm.get('cargo_empresa').invalid && this.NuevoUserForm.get('cargo_empresa').touched
  }

  get contrasenaUsuarioNoValido() {
    return this.NuevoUserForm.get('contrasena_usuario').invalid && this.NuevoUserForm.get('contrasena_usuario').touched
  }
  
  crearFormulario() {
    this.NuevoUserForm = this.fb.group({
      cc_usuario        : [ , [ Validators.required, Validators.minLength(7)]],
      nombre_usuario    : [ , [ Validators.required, Validators.minLength(7)]],
      cargo_empresa     : [ , [ Validators.required]],
      contrasena_usuario: [ , [ Validators.required, Validators.minLength(8)]],
    })
  }
  
  guardar(){
    let usuario = {
      cc_usuario        : this.NuevoUserForm.value.cc_usuario, 
      nombre_usuario    : encodeURIComponent(this.NuevoUserForm.value.nombre_usuario),
      cargo_empresa     : encodeURIComponent(this.NuevoUserForm.value.cargo_empresa),
      contrasena_usuario: encodeURIComponent(this.NuevoUserForm.value.contrasena_usuario)
    }
    if( this.NuevoUserForm.invalid ){ return; }
    else{
      Swal.fire({
        text: 'Estás seguro?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true}).then( () => {
          this.auth.registrarUsuario(usuario).subscribe(
            resp => { resp;
              Swal.fire({
                title: decodeURIComponent(usuario.nombre_usuario),
                html: `${resp.message}. Debes esperar hasta que el administrador te valide.`,
                icon: 'success'
              });
            }, (error) => {
              Swal.fire({
                title: decodeURIComponent(usuario.nombre_usuario),
                html: error.error.message,
                icon: 'error'
              });
            }     
          )
        })
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';
import { UsuarioModel } from 'src/app/models/usuario.models';
import { AuthService } from 'src/app/Servicios/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  LoginUserForm: FormGroup;
  usuario: UsuarioModel = new UsuarioModel();
  recuerdame = false;
  
  constructor(private auth: AuthService, private router:Router,
     private fb: FormBuilder) {
       
      this.LoginUserForm = new FormGroup({
        cc_usuario         : new FormControl(),
        contrasena_usuario : new FormControl() 
     });
      }

  ngOnInit() {
    //si recarga la pagiina y que el correo se mantega
    this.crearFormulario();
  }

  get ccUsuarioNoValido() {
    return this.LoginUserForm.get('cc_usuario').invalid && this.LoginUserForm.get('cc_usuario').touched
  }

  get contrasenaUsuarioNoValido() {
    return this.LoginUserForm.get('contrasena_usuario').invalid && this.LoginUserForm.get('contrasena_usuario').touched
  }

  crearFormulario() {
    this.LoginUserForm = this.fb.group({
      cc_usuario        : [ , [ Validators.required, Validators.minLength(7)]],
      contrasena_usuario: [ , [ Validators.required, Validators.minLength(8)]]
    })
  }

  //login
  login( ){
    console.log(this.LoginUserForm.value.cc_usuario, encodeURIComponent(this.LoginUserForm.value.contrasena_usuario));
    if( this.LoginUserForm.invalid ){ return; }
    else{
      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text: 'Espere por favor...'
      });
      Swal.showLoading();
      this.auth.login( this.LoginUserForm.value.cc_usuario, encodeURIComponent(this.LoginUserForm.value.contrasena_usuario))
        .subscribe( resp => {
          //console.log("this.LoginUserForm.get('cc_usuario')",typeof(JSON.stringify(this.LoginUserForm.get('cc_usuario'))))
          //localStorage.setItem("cc",JSON.stringify(this.LoginUserForm.get('cc_usuario')))
          this.auth.guardarToken(resp);
          //login valido
          Swal.close();
          this.router.navigate(['/lotes']);   
          //
          //recordar contraseña
          /*if(this.recuerdame){
            localStorage.setItem('correo_usuario', this.correo_usuario);
          }*/
          
        }, (err)=> {
          console.log("errorLogin",err.error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error al autenticar',
            text: err.error.message
          });
        });
        
     } 
    }
  }


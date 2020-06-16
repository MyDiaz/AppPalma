import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
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

  usuario: UsuarioModel = new UsuarioModel();
  recuerdame = false;
  
  constructor(private auth: AuthService, 
    private router:Router) { }

  ngOnInit() {
    //si recarga la pagiina y que el correo se mantega
    if(localStorage.getItem('email')){
      this.usuario.email = localStorage.getItem('email');
      this.recuerdame = true;
    }
  }

  //login
  login( form:NgForm ){
    if( form.invalid ){ return; }
    else{
      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text: 'Espere por favor...'
      });
      Swal.showLoading();

      this.auth.login( this.usuario )
        .subscribe( resp => {
          //login valido
          console.log(resp);
          Swal.close();
          
          //recoradar contraseña
          if(this.recuerdame){
            localStorage.setItem('email', this.usuario.email);
          }

          this.router.navigateByUrl('/lotes'); 

        }, (err)=> {
          console.log(err.error.error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error al autenticar',
            text: 'err.error.error.message'
          });
        });
    }
  }

 

}

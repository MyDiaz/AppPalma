import { Component, OnInit } from '@angular/core';
import { UsuarioModel } from 'src/app/models/usuario.models';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/Servicios/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  
  usuario: UsuarioModel;
  recuerdame = false;

  constructor(private auth: AuthService, 
    private router:Router) { }

  ngOnInit( ) { 
    this.usuario = new UsuarioModel();
  }
  
  onSubmit( form: NgForm ){
    if (form.invalid) { return; }
    else{ 
      Swal.fire({
        allowOutsideClick: false,
        icon: 'info',
        text: 'Espere por favor...'
      });
      Swal.showLoading();
      this.auth.nuevoUsuario(this.usuario)
      .subscribe( resp => {
        console.log(resp);
        Swal.close();

        //recordar
        if(this.recuerdame){
          localStorage.setItem('email', this.usuario.email);
        }

        this.router.navigateByUrl('/home');

      }, (err) => {
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

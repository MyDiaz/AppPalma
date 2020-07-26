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
    
  }

  //login
  login( form:NgForm ){
    
}
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Servicios/auth.service';
import { UsuarioService } from '../../../acceso/usuario.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router'
import { UsuarioModel } from 'src/app/models/usuario.models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  
  cc_usuario: string;
  usuario: UsuarioModel;
  estaAutenticado$: Observable<boolean>;
  
  constructor(private authService: AuthService, private router:Router, 
    private usuarioService:UsuarioService) { 
      this.usuario = {
        cc_usuario: "",
        nombre_usuario: "",
        rol: "",
        cargo_empresa: "",
        contrasena_usuario:""
      } 
    }

  ngOnInit() {
    console.log("NAVBAR")
    this.cc_usuario = this.authService.getIdUsuario();
    setTimeout(() => {
      this.usuarioService.getUsuario(this.cc_usuario).subscribe(
      (data: UsuarioModel) => this.usuario = { ...data},
      error => {
          console.log("Error en getUsuario-Navbar", error);
        },
        () => {
          //this.usuario$ = data;
          console.log("Usuario:", this.usuario);
          console.log("object", this.estaAutenticado$);
        }  
    )
    }, 5000);
    
    this.estaAutenticado$ = this.authService.isLoggedIn;
    //console.log("this.authService.isLoggedIn", this.authService.isLoggedIn);
  }

  salir(){
    this.authService.cerrarSesion();
    this.router.navigateByUrl('login');
  }

}

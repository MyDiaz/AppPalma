import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Servicios/auth.service';
import { Router } from '@angular/router'
import { UsuarioModel } from 'src/app/models/usuario.models';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  
  cc_usuario: string;
  usuario: UsuarioModel;
  
  constructor(private authService: AuthService, private router:Router, 
    private usuarioService:UsuariosService) { 
      this.usuario = new UsuarioModel();
    }

  ngOnInit() {
    console.log("NAVBAR")
    this.cc_usuario = this.authService.getIdUsuario();
    this.usuarioService.getUsuario(this.cc_usuario).subscribe(
      (usuario: UsuarioModel) => this.usuario = { ...usuario},
      error => {
        console.log("Error en getUsuario-Navbar", error);
      },
      () => {
        console.log("Usuario:", this.usuario);
      }
    );
  }

  salir(){
    this.authService.cerrarSesion();
    this.router.navigateByUrl('login');
  }

}

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
  usuario$: Observable<UsuarioModel>;
  estaAutenticado$: Observable<boolean>;
  
  constructor(private authService: AuthService, private router:Router, 
    private usuarioService:UsuarioService) { }

  ngOnInit() {
    this.cc_usuario = this.authService.getIdUsuario();
    this.usuarioService.getUsuario(this.cc_usuario).subscribe(
      data => {
        console.log("Usuario:", data[0]);
        this.usuario$ = data[0];
      },
      error => {
          console.log("Error en getUsuario-Navbar", error);
        }  
    )
    this.estaAutenticado$ = this.authService.isLoggedIn;
    //console.log("this.authService.isLoggedIn", this.authService.isLoggedIn);
  }

  salir(){
    this.authService.cerrarSesion();
    this.router.navigateByUrl('login');
  }

}

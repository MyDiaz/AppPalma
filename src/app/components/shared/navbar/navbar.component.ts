import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Servicios/auth.service';
import { UsuarioService } from '../../../acceso/usuario.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  
  cc_usuario:string;
  usuario:any;
  estaAutenticado$: Observable<boolean>;
  
  constructor(private authService: AuthService, private router:Router, 
    private usuarioService:UsuarioService) { }

  ngOnInit() {
    this.cc_usuario = this.authService.getIdUsuario();
    this.usuarioService.getUsuario(this.cc_usuario).subscribe(
      data => {
        this.usuario = data;
      },
      error => {
          console.log(error);
        }  
    )
      this.estaAutenticado$ = this.authService.isLoggedIn;
    
  }

  salir(){
    this.authService.cerrarSesion();
    this.router.navigateByUrl('login');
  }

}

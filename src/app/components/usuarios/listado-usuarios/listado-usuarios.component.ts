import { Component, OnInit } from '@angular/core';
import { UsuariosService  } from '../../../Servicios/usuarios.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioModel } from 'src/app/models/usuario.models';


@Component({
  selector: 'app-listado-usuarios',
  templateUrl: './listado-usuarios.component.html',
  styleUrls: ['./listado-usuarios.component.css']
})
export class ListadoUsuariosComponent implements OnInit {

  usuarios:UsuarioModel[] = []; 
  cargando:boolean = false;
  hayUsuarios:boolean = false;
  bandera:boolean = false;
  mensajeError:string;
  rta:any;

  constructor(private usuariosService:UsuariosService, private router: Router) {
  }

  ngOnInit(): void {
    this.usuariosService.getUsuarios().subscribe( data => {
      this.usuarios = data;
      console.log("Usuarios:", this.usuarios);

      if(this.usuarios.length > 0) this.hayUsuarios = true;
    }, err => {
      this.bandera = true;
      this.mensajeError = err.error.mensaje;
      console.log(err);
      if( err.status == 0 ) this.mensajeError = "Servicio no disponible"
    }, () => {
      this.cargando = true;
    });
  }

  nuevoUsuario(){
    this.router.navigateByUrl('nuevo-usuario')
  }

  editarUsuario(cc_usuario){
    this.router.navigateByUrl(`editar-usuario/${cc_usuario}`)
  }

  deshabilitarUsuario(cc_usuario) {
    console.log("Deshabilitar Usuario:", cc_usuario);
    this.usuariosService.deshabilitarUsuario(cc_usuario).subscribe(
      (respuesta) => {
        Swal.fire({
          title: 'Usuario deshabilitado!',
          icon: 'success',
          showConfirmButton: true}).then(() =>
            this.usuarios.find(usuario => usuario.cc_usuario === cc_usuario).validado = false);
      }
      ,(err) => {
        Swal.fire({
          title: 'Error!',
          html: `No fue posible deshabilitar el usuario.`,
          icon: 'error',
          showConfirmButton: true});
      }
    );
  }

  habilitarUsuario(cc_usuario) {
    console.log("Habilitar Usuario:", cc_usuario);
    this.usuariosService.habilitarUsuario(cc_usuario).subscribe(
      (respuesta) => {
        Swal.fire({
          title: 'Usuario habilitado!',
          icon: 'success',
          showConfirmButton: true}).then(() =>
            this.usuarios.find(usuario => usuario.cc_usuario === cc_usuario).validado = true);
      }
      ,(err) => {
        Swal.fire({
          title: 'Error!',
          html: `No fue posible habilitar el usuario.`,
          icon: 'error',
          showConfirmButton: true});
      }
    );
  }
}

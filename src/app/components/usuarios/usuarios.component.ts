import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Servicios/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';
import Swal from 'sweetalert2';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  actualizarUsuarioForm:FormGroup;
  cambiarContrasenaForm:FormGroup;
  cc_usuario:string;
  usuario:any;
  cargando:boolean = false;

  constructor(private authService: AuthService, private router:Router, 
    private usuariosService:UsuariosService, private fb: FormBuilder, private modalService: NgbModal) { }

  ngOnInit() {
    this.cc_usuario = this.authService.getIdUsuario();
    this.cargando = true;
    this.usuariosService.getUsuario(this.cc_usuario).subscribe(
      data => {
        this.usuario = data;
        this.crearFormularioUsuario();
        this.crearFormularioContrasena();
      },
      error => {
        console.log(error);
      },
      () => this.cargando = false
    )
  }

  crearFormularioUsuario() {
      this.actualizarUsuarioForm = this.fb.group({
        nombre_usuario      : [ `${this.usuario.nombre_usuario}`, [ Validators.required, Validators.minLength(5) ]],
        telefono : [ `${this.usuario.telefono}`, [ Validators.required ]],
        correo    : [ `${this.usuario.correo}`, [ Validators.required, Validators.email ]]
      });
  }

  crearFormularioContrasena() {
      this.cambiarContrasenaForm = this.fb.group({
        contrasena_actual      : [ , [ Validators.required, Validators.minLength(8) ]],
        contrasena_nueva : [ , [ Validators.required, Validators.minLength(8) ]]
      });
  }

  get nombreUsuarioNoValido() {
    return this.actualizarUsuarioForm.get('nombre_usuario').invalid && this.actualizarUsuarioForm.get('nombre_usuario').touched
  }

  get contrasenaUsuarioNoValido() {
    return this.actualizarUsuarioForm.get('contrasena_nueva').invalid && this.actualizarUsuarioForm.get('contrasena_nueva').touched
  }

  actualizarUsuario() {
    console.log("Body para actualizar usuario", this.usuario);
    this.usuariosService.updateProfile(this.actualizarUsuarioForm.value).subscribe(
      resp => {
        this.usuario = resp;
        Swal.fire({
          title: decodeURIComponent(this.usuario.nombre_usuario),
          html: 'El usuario se guardó correctamente',
          icon: 'success',
          showConfirmButton: true});
      }, (error) => {
        Swal.fire({
          title: decodeURIComponent(this.usuario.nombre_usuario),
          html: error.error.message,
          icon: 'error'
        });
      }     
    )
  }

  cambiarContrasena() {
    this.usuariosService.changePassword(this.cambiarContrasenaForm.value).subscribe(
      resp => {
        this.modalService.dismissAll("Submit successful");
        this.cambiarContrasenaForm.setValue({contrasena_actual: '', contrasena_nueva: ''})
        Swal.fire({
          title: decodeURIComponent(this.usuario.nombre_usuario),
          html: `${resp.message}.`,
          icon: 'success',
          showConfirmButton: true});
      }, (error) => {
        Swal.fire({
          title: decodeURIComponent(this.usuario.nombre_usuario),
          html: error.error.message,
          icon: 'error'
        });
      }     
    )
  }

  openCambiarContrasena(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', centered: true}).result
      .then(console.log)
      .catch(console.log);
  }
}

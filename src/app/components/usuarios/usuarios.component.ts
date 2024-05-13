import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Servicios/auth.service';
import { FormGroup, FormControl,FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  
  actualizarUsuarioForm:FormGroup;
  cc_usuario:string;
  usuario:any;
  cargando:boolean = false;

  constructor(private authService: AuthService, private router:Router, 
    private usuariosService:UsuariosService, private fb: FormBuilder) { }

  ngOnInit() {
    this.cc_usuario = this.authService.getIdUsuario();
    this.usuariosService.getUsuario(this.cc_usuario).subscribe(
      data => {
        this.usuario = data;
        this.cargando = false;
        this.crearFormulario();
      },
      error => {
          console.log(error);
        }  
    )
    this.cargando = true;
    
  }

  crearFormulario() {
      this.actualizarUsuarioForm = this.fb.group({
        nombre_usuario      : [ `${this.usuario.nombre_usuario}`, [ Validators.required, Validators.minLength(5) ]],
        contrasena_anterior : [ , [ Validators.required, Validators.minLength(8) ]],
        contrasena_nueva    : [ , [ Validators.required, Validators.minLength(8) ]]
      });
  }

  get nombreUsuarioNoValido() {
    return this.actualizarUsuarioForm.get('nombre_usuario').invalid && this.actualizarUsuarioForm.get('nombre_usuario').touched
  }

  get contrasenaUsuarioNoValido() {
    return this.actualizarUsuarioForm.get('contrasena_nueva').invalid && this.actualizarUsuarioForm.get('contrasena_nueva').touched
  }

  actualizarUsuario(){
    console.log(this.actualizarUsuarioForm.value);
    console.log("pq no funciona");
  }

}

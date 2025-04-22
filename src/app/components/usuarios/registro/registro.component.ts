import { Component, OnInit } from '@angular/core';
import { UsuarioModel } from 'src/app/models/usuario.models';
import { FormGroup,FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/Servicios/auth.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from 'src/app/Servicios/usuarios.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  
  NuevoUserForm: FormGroup;
  ccUsuario: string;
  cargando = true;
  usuarioNuevo = true;

  constructor(private fb: FormBuilder, private auth: AuthService,
    private router:Router, private activatedRoute:ActivatedRoute,
    private usuariosService:UsuariosService) {
      this.crearFormulario();
    }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.ccUsuario = params.get('cc_usuario');
      this.usuarioNuevo = this.ccUsuario === undefined || this.ccUsuario === null;
      this.usuariosService.getUsuario(this.ccUsuario).subscribe(
        data => {
          this.NuevoUserForm.get('cc_usuario').setValue(data.cc_usuario);
          this.NuevoUserForm.get('nombre_usuario').setValue(data.nombre_usuario);
          this.NuevoUserForm.get('telefono').setValue(data.telefono);
          if (data.correo !== undefined) {
            this.NuevoUserForm.get('correo').setValue(data.correo);
          }
          this.NuevoUserForm.get('rol').setValue(data.rol);
          this.NuevoUserForm.get('cargo_empresa').setValue(data.cargo_empresa);
        },
        error => {
          console.log(error);
        }
      )
    },
    () => {},
    () => {
      this.cargando = false;
    });
  }
  
  get ccUsuarioNoValido() {
    return this.NuevoUserForm.get('cc_usuario').invalid && this.NuevoUserForm.get('cc_usuario').touched
  }

  get nombreUsuarioNoValido() {
    return this.NuevoUserForm.get('nombre_usuario').invalid && this.NuevoUserForm.get('nombre_usuario').touched
  }

  get telefonoNoValido() {
    return this.NuevoUserForm.get('telefono').invalid && this.NuevoUserForm.get('telefono').touched
  }

  get rolNoValido() {
    return this.NuevoUserForm.get('rol').touched
    && this.NuevoUserForm.get('rol').invalid;
  }

  get emailNoValido() {
    return this.NuevoUserForm.get('correo').invalid
  }

  get cargoNoValido() {
    return this.NuevoUserForm.get('cargo_empresa').touched
    && this.NuevoUserForm.get('cargo_empresa').invalid;
  }

  get contrasenaUsuarioNoValido() {
    return this.usuarioNuevo && (this.NuevoUserForm.get('contrasena_usuario').value === null
    || this.NuevoUserForm.get('contrasena_usuario').value.length < 8
    && this.NuevoUserForm.get('contrasena_usuario').touched)
    || !this.usuarioNuevo && this.NuevoUserForm.value.contrasena_usuario !== null
    && this.NuevoUserForm.value.contrasena_usuario.length < 8;
  }
  
  crearFormulario() {
    this.NuevoUserForm = this.fb.group({
      cc_usuario        : [ , [ Validators.required, Validators.minLength(7)]],
      nombre_usuario    : [ , [ Validators.required, Validators.minLength(7)]],
      telefono          : [ , [ Validators.required, Validators.pattern("[0-9]{10}")]],
      correo            : [ , [ Validators.email]],
      rol               : [ , [ Validators.pattern("(admin)|(user)")]],
      cargo_empresa     : [ , [ Validators.pattern("(Administrador)|(Supervisor de campo)")]],
      contrasena_usuario: [ , [ ]],
    })
    this.NuevoUserForm.get('cargo_empresa').setValue('cargo')
    this.NuevoUserForm.get('rol').setValue('rol')
  }

  registrarUsuarioNuevo(usuario) {
    this.auth.registrarUsuario(usuario).subscribe(
      resp => { resp;
        Swal.fire({
          title: decodeURIComponent(usuario.nombre_usuario),
          html: `${resp.message}.`,
          icon: 'success',
          showConfirmButton: true}).then(() => 
            this.router.navigateByUrl('listado-usuarios'));
      }, (error) => {
        Swal.fire({
          title: decodeURIComponent(usuario.nombre_usuario),
          html: error.error.message,
          icon: 'error'
        });
      }     
    )
  }

  updateUsuario(usuario) {
    this.usuariosService.updateUsuario(this.ccUsuario, usuario).subscribe(
      resp => { resp;
        Swal.fire({
          title: decodeURIComponent(usuario.nombre_usuario),
          html: `${resp.message}.`,
          icon: 'success',
          showConfirmButton: true}).then(() => 
            this.router.navigateByUrl('listado-usuarios'));
      }, (error) => {
        Swal.fire({
          title: decodeURIComponent(usuario.nombre_usuario),
          html: error.error.message,
          icon: 'error'
        });
      }
    )
  }
  
  guardar(){
    let usuario:UsuarioModel = {
      cc_usuario        : this.NuevoUserForm.value.cc_usuario, 
      nombre_usuario    : encodeURIComponent(this.NuevoUserForm.value.nombre_usuario),
      cargo_empresa     : encodeURIComponent(this.NuevoUserForm.value.cargo_empresa),
      rol               : encodeURIComponent(this.NuevoUserForm.value.rol),
      telefono          : this.NuevoUserForm.value.telefono,
      correo            : this.NuevoUserForm.value.correo
    };
    if (this.usuarioNuevo || this.NuevoUserForm.value.contrasena_usuario !== null) {
      usuario = {...usuario, contrasena_usuario: encodeURIComponent(this.NuevoUserForm.value.contrasena_usuario)};
    }

    console.log('cc_usuario:', this.NuevoUserForm.get('cc_usuario').invalid);
    console.log('nombre_usuario:', this.NuevoUserForm.get('nombre_usuario').invalid);
    console.log('telefono:', this.NuevoUserForm.get('telefono').invalid);
    console.log('rol:', this.NuevoUserForm.get('rol').invalid);
    console.log('correo:', this.NuevoUserForm.get('correo').invalid);
    console.log('cargo_empresa:', this.NuevoUserForm.get('cargo_empresa').invalid);

    if (this.NuevoUserForm.invalid || this.contrasenaUsuarioNoValido) {
      Swal.fire({
        text: 'Falta completar algunos datos :/',
        icon: 'warning',
        showCancelButton: false,
        showConfirmButton: true});
    } else {
      Swal.fire({
        text: 'Estás seguro?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true}).then( (result) => {
          if (result.isConfirmed) {
            if (this.usuarioNuevo) {
              this.registrarUsuarioNuevo(usuario);
            } else {
              this.updateUsuario(usuario);
            }
          }
        })
    }
  }
}

export class UsuarioModel{
    cc_usuario: string; 
    nombre_usuario: string;
    telefono: string;
    correo?: string;
    rol: string; 
    cargo_empresa: string; 
    contrasena_usuario?: string;
    validado?: boolean;
}

export class UsuarioProfile{
    nombre_usuario: string;
    telefono: string;
    correo?: string;
}

export class NewPassword {
    contrasena_actual: string;
    contrasena_nueva: string;
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../Servicios/auth.service';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsuarioModel } from 'src/app/models/usuario.models'; 

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  
  private url:string = 'http://127.0.0.1:3000'; 

  constructor(private http: HttpClient, private authService:AuthService) {
      
   }

   getUsuario(cc_usuario:string){
    return this.http.get<UsuarioModel>(`${this.url}/usuario/${cc_usuario}`)
    //.pipe(map( data => data))
    .pipe(map(data => data))
    //.map(key => data[key])));
  }

   
}

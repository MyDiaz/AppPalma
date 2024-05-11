import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; 
import { UsuarioModel } from '../models/usuario.models';
import { respuesta } from '../models/resp.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http: HttpClient) { }
  
  getUsuarios(){
    return this.http.get<UsuarioModel[]>(`${environment.url}/usuarios`);
  };

  getUsuario(cc_usuario:string){
   return this.http.get<UsuarioModel>(`${environment.url}/usuarios/${cc_usuario}`);
  }

  updateUsuario(cc_usuario:string, usuario:UsuarioModel): Observable<respuesta> {
    return this.http.put<respuesta>(`${environment.url}/usuarios/${cc_usuario}`, usuario);
  }

  deshabilitarUsuario(cc_usuario:string): Observable<respuesta> {
    return this.http.patch<respuesta>(`${environment.url}/usuarios/${cc_usuario}`, {validado: false});
  }

  habilitarUsuario(cc_usuario:string): Observable<respuesta> {
    return this.http.patch<respuesta>(`${environment.url}/usuarios/${cc_usuario}`, {validado: true});
  }
}

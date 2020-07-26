import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { respuesta } from '../models/resp.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url_autenticacion:string = 'http://localhost:3000'; 
  
  constructor( private http: HttpClient ) { }


  registrarUsuario ( usuario ): Observable<respuesta> {
    return this.http.post<respuesta>(`${this.url_autenticacion}/registro`, usuario)
    .pipe(map (resp =>{
      return resp
    })
  );}

  

}
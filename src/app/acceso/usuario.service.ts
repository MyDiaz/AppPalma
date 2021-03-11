import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../Servicios/auth.service';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  
  private url:string = 'http://localhost:3000'; 

  constructor(private http: HttpClient, private authService:AuthService) {
      
   }

   getUsuario(cc_usuario:string): Observable<any>{
    return this.http.get<any>(`${this.url}/usuario/${cc_usuario}`)
    .pipe(map( data => data));
  }

   
}

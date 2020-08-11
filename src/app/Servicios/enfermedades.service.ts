import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpHandler } from '@angular/common/http';
import { respuesta } from '../models/resp.model';
import { map, catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnfermedadesService {
  
  private url_enfermedades:string = 'http://localhost:3000/enfermedad';

  constructor(private http: HttpClient) { }

  getEnfermedades(){
    return this.http.get(`${this.url_enfermedades}`);
  }

  postEnfermedadEtapas(formEnfermedadEtapas): Observable<respuesta>{
    return this.http.post<respuesta>(`${this.url_enfermedades}-etapas`,formEnfermedadEtapas)
    .pipe(map( data => data ));
  }

  postEnfermedad(formEnfermedad):Observable<respuesta>{
    return this.http.post<respuesta>(`${this.url_enfermedades}`,formEnfermedad)
    .pipe(map( data => data ));
  }
}

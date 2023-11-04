import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { respuesta } from '../models/resp.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 


@Injectable({
  providedIn: 'root'
})

export class EnfermedadesService {

  constructor(private http: HttpClient) { 
  }
  
  //enfermedades
  getEnfermedades(){
    return this.http.get(`${environment.url}/enfermedades`);
  }

  getEnfermedadesConcat(){
    return this.http.get<any>(`${environment.url}/enfermedades_etapas_concat`);
  }

  getEnfermedad(nombre_enfermedad){
    return this.http.get(`${environment.url}/enfermedad/${nombre_enfermedad}`);
  }

  postEnfermedad(formEnfermedad):Observable<respuesta>{
    return this.http.post<respuesta>(`${environment.url}/enfermedades`, formEnfermedad)
    .pipe(map( data => data ));
  }

  putEnfermedad(formEnfermedad, nombre_enfermedad):Observable<respuesta>{
    return this.http.put<respuesta>(`${environment.url}/enfermedad/${nombre_enfermedad}`, formEnfermedad)
    .pipe(data => data);
  }

  //enfermedades con etapas 
  getEnfermedadesEtapas(){
    return this.http.get(`${environment.url}/enfermedad-etapas`);
  }

  getEnfermedadEtapas(id_enfermedad){
    return this.http.get(`${environment.url}/enfermedad-etapas/${id_enfermedad}`);
  }

  postEnfermedadEtapas(formEnfermedadEtapas):Observable<respuesta>{
    return this.http.post<respuesta>(`${environment.url}/enfermedad-etapas`, formEnfermedadEtapas)
    .pipe(map( data => data ));
  }

  eliminarEnfermedad(nombre_enfermedad){
    return this.http.delete(`${environment.url}/enfermedad/${nombre_enfermedad}`)
    .pipe(map( data => data ));
  }

  actualizarEnfermedadConEtapas(nombre_enfermedad,formEnfermedadEtapas):Observable<respuesta>{
    return this.http.post<respuesta>(`${environment.url}/enfermedad-etapas/${nombre_enfermedad}`, formEnfermedadEtapas)
    .pipe(map( data => data ));
  }

  //obtener el registro de las enfermedades en palmas realizadas
  getEnfermedadesRegistradas(){
    return this.http.get<any>(`${environment.url}/registro-enfermedades`).pipe(map( data => data));
  }

  filtrarEnfermedades(){
    
  }

  getImagenesRegistroEnfermedad(id:string ){
    return this.http.get<any>(`${this.url}/registro-enfermedades/imagenes/${id}`).pipe(map( data => data));
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { respuesta } from '../models/resp.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 


@Injectable({
  providedIn: 'root'
})
export class PlagasService {

  constructor(private http: HttpClient) { }
  
  getPlaga(nombre_comun_plaga){
    return this.http.get(`${environment.url}/plaga/${nombre_comun_plaga}`);
  }  

  getPlagas(){
    return this.http.get(`${environment.url}/plagas`);
  }

  postPlaga(formPlaga):Observable<respuesta>{
    return this.http.post<respuesta>(`${environment.url}/plagas`, formPlaga)
    .pipe(map( data => data ));
  }

  putPlaga(formPlaga,nombre_comun_plaga):Observable<respuesta>{
    return this.http.put<respuesta>(`${environment.url}/plaga/${nombre_comun_plaga}`, formPlaga)
    .pipe(map( data => data ));
  }
  
  eliminarPlaga(nombre_comun_plaga){
    return this.http.delete(`${environment.url}/plaga/${nombre_comun_plaga}`)
    .pipe(map( data => data ));
  }
}


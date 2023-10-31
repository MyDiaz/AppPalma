import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { respuesta } from '../models/resp.model';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class AgroquimicosService {
  
  constructor(private http: HttpClient) { }
  
  getAgroquimicos(){
    return this.http.get(`${environment.url}/agroquimico`);
  }

  getAgroquimico(idProductoAgroquimico){
    return this.http.get(`${environment.url}/agroquimico/${idProductoAgroquimico}`);
  }

  getRegistroAgroquimico(){
    return this.http.get<any>(`${environment.url}/registro_tratamientos`);
  }

  postAgroquimico(formAgroquimico):Observable<respuesta>{
    return this.http.post<respuesta>(`${environment.url}/agroquimico`, formAgroquimico)
    .pipe(map( data => data ));
  }

  eliminarAgroquimico(idProductoAgroquimico){
    return this.http.delete(`${environment.url}/agroquimico/${idProductoAgroquimico}`)
    .pipe(map( data => data ));
  }

  actualizarAgroquimico(idProductoAgroquimico,datosNuevosAgroquimico):Observable<respuesta>{
    return this.http.put<respuesta>(`${environment.url}/agroquimico/${idProductoAgroquimico}`, datosNuevosAgroquimico)
    .pipe(map( data => data ));
  }
}



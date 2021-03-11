import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { respuesta } from '../models/resp.model';

@Injectable({
  providedIn: 'root'
})
export class AgroquimicosService {
  
  private url:string = 'http://localhost:3000';

  constructor(private http: HttpClient) { }
  
  getAgroquimicos(){
    return this.http.get(`${this.url}/agroquimico`);
  }

  getAgroquimico(idProductoAgroquimico){
    return this.http.get(`${this.url}/agroquimico/${idProductoAgroquimico}`);
  }

  postAgroquimico(formAgroquimico):Observable<respuesta>{
    return this.http.post<respuesta>(`${this.url}/agroquimico`, formAgroquimico)
    .pipe(map( data => data ));
  }

  eliminarAgroquimico(idProductoAgroquimico){
    return this.http.delete(`${this.url}/agroquimico/${idProductoAgroquimico}`)
    .pipe(map( data => data ));
  }

  actualizarAgroquimico(idProductoAgroquimico,datosNuevosAgroquimico):Observable<respuesta>{
    return this.http.put<respuesta>(`${this.url}/agroquimico/${idProductoAgroquimico}`, datosNuevosAgroquimico)
    .pipe(map( data => data ));
  }
}



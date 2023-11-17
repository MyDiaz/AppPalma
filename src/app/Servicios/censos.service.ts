import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CensosService {

  constructor(private http: HttpClient) { }

  getCensos() {
    return this.http.get<any>(`${environment.url}/censos`).pipe(map( data => data));
  }

  getImagenesCenso(id:string ){
    return this.http.get<any>(`${environment.url}/censos/imagenes/${id}`).pipe(map( data => data));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpHandler } from '@angular/common/http';
import { respuesta } from '../models/resp.model';
import { map, catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

const httpOptions = { 
  headers: new HttpHeaders({
      'Content-type': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})

export class ViajesService {

  private url_lote:string = 'http://176.31.22.252:3000/viajes';

  constructor(private http: HttpClient, private handleError:HttpHandler) { }

  getViajes(){
    return this.http.get<any>(`${environment.url}/viajes`).pipe(map( data => data));
  }
}
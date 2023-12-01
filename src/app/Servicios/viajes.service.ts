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

  constructor(private http: HttpClient, private handleError:HttpHandler) { }

  getViajes(){
    return this.http.get<any>(`${environment.url}/viajes`).pipe(map( data => data));
  }

  getCensoProductivo(){
    return this.http.get<any>(`${environment.url}/censo-productivo`).pipe(map( data => data));
  }
}
import { Injectable } from '@angular/core';
import { map, catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpHandler } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlateosService {

  constructor(private http: HttpClient, private handleError:HttpHandler) { }

  getPlateos() {
    return this.http.get<any>(`${environment.url}/plateos`).pipe(map( data => data));
}

  getPlateo( id_plateos:string ) {
    return this.http.get<any>(`${environment.url}/plateos/${id_plateos}`).pipe(map( data => data));
  }
}

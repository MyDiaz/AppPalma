import { Injectable } from '@angular/core';
import { map, catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpHandler } from '@angular/common/http';
import { environment } from '../../environments/environment';

const httpOptions = { 
  headers: new HttpHeaders({
      'Content-type': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class CosechasService {

  constructor(private http: HttpClient, private handleError:HttpHandler) { }

  getCosechas() {
    return this.http.get<any>(`${environment.url}/cosechas`).pipe(map( data => data));
}

  getCosecha( id_cosecha:string ) {
    return this.http.get<any>(`${environment.url}/cosecha/${id_cosecha}`).pipe(map( data => data));
  }
}

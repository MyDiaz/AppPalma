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
export class PodasService {

  constructor(private http: HttpClient, private handleError:HttpHandler) { }

  getPodas() {
    return this.http.get<any>(`${environment.url}/podas`).pipe(map( data => data));
}

  getPoda( id_poda:string ) {
    return this.http.get<any>(`${environment.url}/poda/${id_poda}`).pipe(map( data => data));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FertilizacionesService {

  constructor(private http: HttpClient) { }

  getFertilizaciones() {
    return this.http.get<any>(`${environment.url}/fertilizaciones`).pipe(map(data => data));
  }
}

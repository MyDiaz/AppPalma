import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class CensosProductivosService {
  constructor(private http: HttpClient) {}

  getCensosProductivos() {
    return this.http
      .get<any>(`${environment.url}/censo-productivo`)
      .pipe(map((data) => data));
  }

  getCensosProductivosLote(lote: string) {
    return this.http
      .get<any>(`${environment.url}/censo-productivo/${lote}`)
      .pipe(map((data) => data));
  }
}

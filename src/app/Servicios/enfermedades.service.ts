import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { respuesta } from "../models/resp.model";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import {
  CurrentStateResponse,
  MonthlyFitosanitarioSummaryParams,
  MonthlyFitosanitarioSummaryResponse,
} from "../components/estado-fitosanitario/estado-fitosanitario.types";

@Injectable({
  providedIn: "root",
})
export class EnfermedadesService {
  constructor(private http: HttpClient) {}

  //enfermedades
  getEnfermedades() {
    return this.http.get(`${environment.url}/enfermedades`);
  }

  getEnfermedadesConcat() {
    return this.http.get<any>(`${environment.url}/enfermedades_etapas_concat`);
  }

  getEnfermedad(nombre_enfermedad) {
    return this.http.get(`${environment.url}/enfermedad/${nombre_enfermedad}`);
  }

  postEnfermedad(formEnfermedad): Observable<respuesta> {
    return this.http
      .post<respuesta>(`${environment.url}/enfermedades`, formEnfermedad)
      .pipe(map((data) => data));
  }

  putEnfermedad(formEnfermedad, nombre_enfermedad): Observable<respuesta> {
    return this.http
      .put<respuesta>(
        `${environment.url}/enfermedad/${nombre_enfermedad}`,
        formEnfermedad
      )
      .pipe((data) => data);
  }

  //enfermedades con etapas
  getEnfermedadesEtapas() {
    return this.http.get(`${environment.url}/enfermedad-etapas`);
  }

  getEnfermedadEtapas(id_enfermedad) {
    return this.http.get(
      `${environment.url}/enfermedad-etapas/${id_enfermedad}`
    );
  }

  postEnfermedadEtapas(formEnfermedadEtapas): Observable<respuesta> {
    return this.http
      .post<respuesta>(
        `${environment.url}/enfermedad-etapas`,
        formEnfermedadEtapas
      )
      .pipe(map((data) => data));
  }

  eliminarEnfermedad(nombre_enfermedad) {
    return this.http
      .delete(`${environment.url}/enfermedad/${nombre_enfermedad}`)
      .pipe(map((data) => data));
  }

  actualizarEnfermedadConEtapas(
    nombre_enfermedad,
    formEnfermedadEtapas
  ): Observable<respuesta> {
    return this.http
      .put<respuesta>(
        `${environment.url}/enfermedad-etapas/${nombre_enfermedad}`,
        formEnfermedadEtapas
      )
      .pipe(map((data) => data));
  }

  //obtener el registro de las enfermedades en palmas realizadas
  getEnfermedadesRegistradas() {
    return this.http
      .get<any>(`${environment.url}/registro-enfermedades`)
      .pipe(map((data) => data));
  }

  getEstadoFitosanitarioActual(): Observable<CurrentStateResponse> {
    return this.http
      .get<CurrentStateResponse>(
        `${environment.url}/registro-enfermedades/estado-fitosanitario`
      )
      .pipe(map((data) => data));
  }

  getInformeMensualFitosanitario(
    params: MonthlyFitosanitarioSummaryParams
  ): Observable<MonthlyFitosanitarioSummaryResponse> {
    let httpParams = new HttpParams();
    (Object.keys(params || {}) as Array<
      keyof MonthlyFitosanitarioSummaryParams
    >).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http
      .get<MonthlyFitosanitarioSummaryResponse>(
        `${environment.url}/registro-enfermedades/informe-mensual`,
        { params: httpParams }
      )
      .pipe(map((data) => data));
  }

  filtrarEnfermedades() {}

  getImagenesRegistroEnfermedad(id: string) {
    return this.http
      .get<any>(`${environment.url}/registro-enfermedades/imagenes/${id}`)
      .pipe(map((data) => data));
  }
}

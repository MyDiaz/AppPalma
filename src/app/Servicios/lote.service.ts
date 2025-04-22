import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpHandler } from '@angular/common/http';
import { respuesta } from '../models/resp.model';
import { map, catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

import { EnfermedadNombre, EtapaEnfermedad } from '../models/enfermedadModel';

const headers = new HttpHeaders({
  'Content-Type': 'application/json',
});


@Injectable()
export class LoteService {

  constructor(private http: HttpClient, private handleError: HttpHandler) { }

  getLotes() {
    return this.http.get(`${environment.url}/lote`);
  }

  getLote(nombre: string) {
    return this.http.get(`${environment.url}/lote/${nombre}`).pipe(map(data => data[0]));
  }
  getLoteMapaUrl(nombre: string) {
    return `${environment.url}/lote/mapa/` + encodeURIComponent(nombre);
  }

  postLote(datosLote): Observable<respuesta> {
    return this.http.post<respuesta>(`${environment.url}/lote`, datosLote).pipe(map(data => data));
  }

  putLote(datosLote, nombre: string): Observable<respuesta> {
    return this.http.put<respuesta>(`${environment.url}/lote/${nombre}`, datosLote, { headers }).pipe(map(data => data));
  }


  getPalmasLote(nombre: string) {
    return this.http.get(`${environment.url}/movil/palmas/${nombre}`);
  }






  private plagas: any[] = [
    { nombre: "Arañita roja" },
    { nombre: "Ácaro del fronde" },
    { nombre: "Chinche de encaje" },
    { nombre: "Torito" },
    { nombre: "Cucarroncito aplanado del follaje" },

  ]

  private agroqumicos: any[] = [
    {
      nombre: "Fipronil",
      tipo: "insectisida"
    },
    {
      nombre: "Lorsban",
      tipo: "insectisida"
    },
    {
      nombre: "Kunfu",
      tipo: "insectisida"
    },
    {
      nombre: "Brigada",
      tipo: "insectisida"
    },
    {
      nombre: "Nilo",
      tipo: "insectisida"
    },
    //
    {
      nombre: "Dithane",
      tipo: "Fungicidas"
    },
    {
      nombre: "Ridomil",
      tipo: "Fungicidas"
    },
    {
      nombre: "Bélico",
      tipo: "Fungicidas"
    },
    {
      nombre: "Manzate",
      tipo: "Fungicidas"
    }
  ]

  private enfermedades: any[] = [
    { nombre: "Rayo" },
    { nombre: "Pudrción de Cogollo" },
    { nombre: "Pudrición de Estipite" },
    { nombre: "Marchitez" },
    { nombre: "Marchitez sorpresiva" },
  ]

  getPlagas(): any[] {
    return this.plagas;
  }

  getAgroquimicos(tipo: string) {
    let agroq = [];
    for (let i of this.agroqumicos) {
      if (i.tipo == tipo) {
        agroq.push(i);
      }
    }
    return agroq;
    //console.log(agroq);
    //return this.agroqumicos;
  }

  getEnfermedades() {
    return this.enfermedades;
  }

  getEnfermedadesServer(): Observable<EnfermedadNombre[]> {
    return new Observable((observer) => {
      this.http.get(`${environment.url}/enfermedades`).subscribe(
        (data: []) => {
          let newData: EnfermedadNombre[] = [];
          data.forEach((element) => {
            newData.push({
              nombre: element["nombre_enfermedad"],
            });
          });
          observer.next(newData);
          observer.complete();
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  getEtapasServer(): Observable<EtapaEnfermedad[]> {
    return new Observable((observer) => {
      this.http.get(`${environment.url}/enfermedad-etapas`).subscribe(
        (data: []) => {
          let newData: EtapaEnfermedad[] = [];
          data.forEach((element) => {
            newData.push({
              nombre_enfermedad: element["nombre_enfermedad"],
              nombre_etapa: element["etapa_enfermedad"]
            });
          });
          observer.next(newData);
          observer.complete();
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }



}

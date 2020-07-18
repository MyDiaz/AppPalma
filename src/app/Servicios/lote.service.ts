import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpHandler } from '@angular/common/http';
//import { LoteModel } from '../models/lote.models';
import { respuesta } from '../models/resp.model';

import { map, catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

const httpOptions = { 
    headers: new HttpHeaders({
        'Content-type': 'application/json'
    })
}
@Injectable()
export class LoteService{

    private url_lote:string = 'http://localhost:3000/lote';

    constructor( private http: HttpClient, private handleError:HttpHandler) { }

        getLotes(){
            return this.http.get(this.url_lote);
        }

        getLote( nombre:string ) {
            return this.http.get(`${this.url_lote}/${nombre}`).pipe(map( data => data[0]));8
        }

        postLote(datosLote): Observable<respuesta> {
            return this.http.post<respuesta>(this.url_lote, datosLote).pipe(map( data => data ));
        }

        putLote(datosLote, nombre:string): Observable<respuesta> {
            return this.http.put<respuesta>(`${this.url_lote}/${nombre}`, datosLote).pipe(map( data => data ));
        }







        

    private plagas:any[] = [
        { nombre: "Arañita roja"},
        { nombre: "Ácaro del fronde"},
        { nombre: "Chinche de encaje"},
        { nombre: "Torito"},
        { nombre: "Cucarroncito aplanado del follaje"},

    ]
    
    private agroqumicos:any[]= [
        { nombre: "Fipronil",
          tipo: "insectisida"},
        { nombre: "Lorsban",
          tipo: "insectisida"},
        { nombre: "Kunfu",
          tipo: "insectisida"},
        { nombre: "Brigada",
          tipo: "insectisida"},
        { nombre: "Nilo",
        tipo: "insectisida"},
        //
        { nombre: "Dithane",
        tipo: "Fungicidas"},
        { nombre: "Ridomil",
        tipo: "Fungicidas"},
        { nombre: "Bélico",
        tipo: "Fungicidas"},
        { nombre: "Manzate",
        tipo: "Fungicidas"}
    ]

    private enfermedades:any[]=[
        {nombre: "Rayo"},
        {nombre: "Pudrción de Cogollo"},
        {nombre: "Pudrición de Estipite"},
        {nombre: "Marchitez"},
        {nombre: "Marchitez sorpresiva"},
    ]

        getPlagas():any[]{
            return this.plagas;
        }

        getAgroquimicos(tipo:string){
            let agroq = [];
            for (let i of this.agroqumicos){
                    if (i.tipo == tipo){
                        agroq.push(i);
                    }
            } 
            return agroq;
            //console.log(agroq);
            //return this.agroqumicos;
        }

        getEnfermedades(){
            return this.enfermedades;
        }


}

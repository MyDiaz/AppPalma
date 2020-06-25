import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
 
@Injectable()
export class LoteService{

    private url_lote:string = 'http://localhost:3000/lote';

    constructor( private http: HttpClient ) { }

        getLotes(){
            return this.http.get(this.url_lote);
        }

        getLote( nombre:string ) {
            return this.http.get(`${this.url_lote}/${nombre}`).pipe(map( data => data[0]));
        }








        

        private lotes:any[] = 
        [
            { nombre: "Cementerio" },
            { nombre: "Casa vieja" },
            { nombre: "Electrificadora Baja" },
            { nombre: "Electrificadora Alto" },
            { nombre: "Acueducto" },
            { nombre: "Ganaderia" },
            { nombre: "Bogota A" },
            { nombre: "Bogota B" },
            { nombre: "Caño Cotiza"},
            { nombre: "Vivero" },
            { nombre: "Infierno" },
            { nombre: "Vega del río" },
            { nombre: "La Ceiba" },
            { nombre: "Bella Isla" },
            { nombre: "Guamo" },
            { nombre: "Lomitas"}
        ];

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

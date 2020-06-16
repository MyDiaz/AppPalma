import { Injectable } from '@angular/core';
 
@Injectable()
export class LoteService{
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

        getLotes():any[]{
            return this.lotes;
        }

        getLote( idx:string ) {
            return this.lotes[idx];
        }

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

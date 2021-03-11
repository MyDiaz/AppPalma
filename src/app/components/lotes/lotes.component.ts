import { Component, OnInit } from '@angular/core';
import { LoteService } from '../../Servicios/lote.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-lotes',
  templateUrl: './lotes.component.html',
  styleUrls: ['./lotes.component.css']
})
export class LotesComponent implements OnInit {

  lotes:any = [];
  bandera_error:boolean = false;
  cargando:boolean = false;
  mensaje_error:string;
  changeText: boolean;
  

  constructor( private _loteService:LoteService,
    private router:Router ) {
      this.changeText = false;
     }

  ngOnInit() {
    this._loteService.getLotes().subscribe(
      data => {
        this.lotes = data;
        this.cargando = false;
      },
      error => {
        this.bandera_error = true;
        this.mensaje_error = error.error.message;
        console.log("error.status", error.status);
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }
        console.log(error);
      });
      this.cargando = true;
  }
   
  verLote( nombre:string ){
    this.router.navigate(['/lote',nombre]);
  }

  agregarNuevoLote(){
    this.router.navigate(['/nuevo-lote']);
  }

}

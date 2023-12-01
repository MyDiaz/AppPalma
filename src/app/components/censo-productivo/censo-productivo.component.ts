import { Component, OnInit } from '@angular/core';
import { LoteService } from '../../Servicios/lote.service';
import { ViajesService } from '../../Servicios/viajes.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-censo-productivo',
  templateUrl: './censo-productivo.component.html',
  styleUrls: ['./censo-productivo.component.css']
})
export class CensoProductivoComponent implements OnInit {

  lotes:any = [];
  censos_productivos:any = [];
  cargando:boolean = false; 
  bandera_error:boolean = false;
  mensaje_error:string;

  constructor(public _viajesService:ViajesService, private _loteService:LoteService) { }

  ngOnInit(): void {
    this._viajesService.getCensoProductivo().subscribe(
      data => {
        this.censos_productivos = data;
        console.log("censos-productivos", this.censos_productivos);
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
      }
    )

    this._loteService.getLotes().subscribe(
      data => {
        this.lotes = data;
        console.log("lotes desde censo-productivo", this.lotes);
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

    
  }

}

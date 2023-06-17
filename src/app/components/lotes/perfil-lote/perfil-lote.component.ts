import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { LoteService } from '../../../Servicios/lote.service';
@Component({
  selector: 'app-lote',
  templateUrl: './perfil-lote.component.html',
  styleUrls: ['./perfil-lote.component.css']

})
export class PerfilLoteComponent implements OnInit{
  kmlUrl:string;
  latitute = 6.8989732;
  longitude = -73.62945;
  // latitute = -19.257753;
  // longitude = 146.823688;
  mapTypeId="satellite";
  lote:any = {};
  nombre_lote:string;
  bandera_error:boolean = false;
  mensaje_error:string;
  zoom = 16;
  constructor( private activatedRoute:ActivatedRoute, private _loteService:LoteService, private router:Router ) 
  { 
    this.activatedRoute.paramMap.subscribe(params => {
      this.nombre_lote = params.get('id');
    });
  }

  ngOnInit() {
    this._loteService.getLote(this.nombre_lote).subscribe(
      data => {
        this.lote = data;
        const blob = new Blob([this.lote.mapa], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);
        this.kmlUrl = url;
      },
      error => {
        this.bandera_error = true;
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }else{ 
          this.mensaje_error = error.error.message
          console.log("error", error);
        }
      });
      
  }

  verRegistros(donde:string){
    this.router.navigate([donde], { queryParams: { lote: this.nombre_lote } });
  }

  verLoteEditar( nombre:string ){
    this.router.navigate(['/editar-lote',nombre]);
  }

}


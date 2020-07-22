import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { LoteService } from '../../../Servicios/lote.service';

@Component({
  selector: 'app-lote',
  templateUrl: './perfil-lote.component.html',
  styles: []
})
export class PerfilLoteComponent implements OnInit{
  
  lote:any = {};
  nombre_lote:string;
  bandera_error:boolean = false;
  mensaje_error:string;

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
      },
      error => {
        this.bandera_error = true;
        if( error.status == 0 ){
          this.mensaje_error = "Servicio no disponible"
        }else{ 
          this.mensaje_error = error.error.message
          console.log("errror", error);
        }
      });
      
  }

  verRegistro( registro:string ):string{
    return registro;
  }

  verLoteEditar( nombre:string ){
    this.router.navigate(['/editar-lote',nombre]);
  }

}

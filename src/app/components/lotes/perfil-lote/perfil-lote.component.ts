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

  constructor( private activatedRoute:ActivatedRoute, private _loteService:LoteService, private router:Router ) 
  { 
    this.activatedRoute.paramMap.subscribe(params => {
      this.nombre_lote = params.get('id');
    });
  }

  ngOnInit() {
    console.log("nombre lote",this.nombre_lote);
    this._loteService.getLote(this.nombre_lote).subscribe(
      data => {
        this.lote = data;
        //console.log("data recibida en lote", data);
      },
      error => {
        console.log("error en lote", error);
      });
      
  }

  verRegistro( registro:string ):string{
    return registro;
  }

  verLoteEditar( nombre:string ){
    this.router.navigate(['/editar-lote',nombre]);
  }

}

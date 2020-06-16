import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { LoteService } from '../../Servicios/lote.service';

@Component({
  selector: 'app-lote',
  templateUrl: './lote.component.html',
  styles: []
})
export class LoteComponent {
  
  lotes:any = {};

  constructor( private activatedRoute:ActivatedRoute, private _loteService:LoteService, private router:Router ) { 
    this.activatedRoute.params.subscribe( params => {
      this.lotes = this._loteService.getLote( params['id']);
    });
  }

  verRegistro( registro:string ):string{
    return registro;
  }

  verEstado(estado:string){
    //this.router.navigate(['/lote', estado]);
    this.router.navigateByUrl(estado);
    console.log(this.router.url)
  }

}

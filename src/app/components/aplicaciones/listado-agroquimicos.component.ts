import { Component, OnInit } from '@angular/core';
import { LoteService } from '../../Servicios/lote.service';

@Component({
  selector: 'app-listado-agroquimicos',
  templateUrl: './listado-agroquimicos.component.html',
  styles: []
})
export class ListadoAgroquimicosComponent implements OnInit {
  
  agroquimicos:any = [];

  constructor(private _loteService:LoteService) {
    this.agroquimicos = this._loteService.getAgroquimicos("Fungicidas");
   }

  ngOnInit() {
  }

}

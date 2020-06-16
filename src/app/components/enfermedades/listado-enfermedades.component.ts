import { Component, OnInit } from '@angular/core';
import { LoteService } from '../../Servicios/lote.service';

@Component({
  selector: 'app-listado-enfermedades',
  templateUrl: './listado-enfermedades.component.html',
  styles: []
})
export class ListadoEnfermedadesComponent implements OnInit {

  enfermedades:any[] = [];

  constructor(private _loteService:LoteService) {
    this.enfermedades = _loteService.getEnfermedades();
   }

  ngOnInit() {
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { LoteService } from '../../Servicios/lote.service';

@Component({
  selector: 'app-listado-plagas',
  templateUrl: './listado-plagas.component.html',
  styles: []
})
export class ListadoPlagasComponent implements OnInit {

  @Input() nombre_plaga:string;  
  plagas:any[] = [];

  constructor(private _loteService:LoteService) { 
    this.plagas = this._loteService.getPlagas();
    this.nombre_plaga = "Chinche";
  }

  ngOnInit() {
  }

}

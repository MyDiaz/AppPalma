import { Component, OnInit } from '@angular/core';
import { LoteService } from '../../Servicios/lote.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-lotes',
  templateUrl: './lotes.component.html',
  styleUrls: ['./lotes.component.css']
})
export class LotesComponent implements OnInit {

  lotes:any[] = [];

  constructor( private _loteService:LoteService,
    private router:Router ) { }

  ngOnInit() {
    this.lotes = this._loteService.getLotes();
  }

  verLote( idx:number ){
    this.router.navigate(['/lote',idx]);
  }

  agregarNuevoLote(){
    this.router.navigate(['/nuevo-lote']);
  }

}

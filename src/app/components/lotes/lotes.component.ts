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

  constructor( private _loteService:LoteService,
    private router:Router ) { }

  ngOnInit() {
    this._loteService.getLotes().subscribe(
      data => {
        this.lotes = data;
        console.log(data);
      },
      error => {
        console.log(error);
      });
  }
   
  verLote( nombre:string ){
    this.router.navigate(['/lote',nombre]);
  }

  agregarNuevoLote(){
    this.router.navigate(['/nuevo-lote']);
  }

}

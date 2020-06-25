import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { LoteService } from '../../Servicios/lote.service';

@Component({
  selector: 'app-lote',
  templateUrl: './lote.component.html',
  styles: []
})
export class LoteComponent implements OnInit{
  
  lote:any = {};
  nombre_lote:string;

  constructor( private activatedRoute:ActivatedRoute, private _loteService:LoteService, private router:Router ) 
  { 
    this.activatedRoute.paramMap.subscribe(params => {
      this.nombre_lote = params.get('id');
    });
  }

  ngOnInit() {
    console.log(this.nombre_lote);
    this._loteService.getLote(this.nombre_lote).subscribe(
      data => {
        this.lote = data;
        console.log(data);
      },
      error => {
        console.log(error);
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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editar',
  templateUrl: './editar-lote.component.html',
  styleUrls: ['./editar-lote.component.css']
})
export class EditarLoteComponent implements OnInit {

  nombre_lote: string;

  constructor( private activatedRoute:ActivatedRoute ) {
   }

  ngOnInit() {
    this.nombre_lote = this.activatedRoute.snapshot.paramMap.get('id');
  }

}

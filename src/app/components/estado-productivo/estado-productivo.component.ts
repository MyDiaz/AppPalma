import { Component, OnInit } from '@angular/core';
//import { Router } from '@angular/router';

@Component({
  selector: 'app-estado-productivo',
  templateUrl: './estado-productivo.component.html',
  styleUrls: ['./estado-productivo.component.css']
})
export class EstadoProductivoComponent implements OnInit {
  //variables 
  fecha:Date  = new Date();
  
  constructor() { }

  ngOnInit() {
  }

}

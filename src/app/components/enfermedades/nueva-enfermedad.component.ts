import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-nueva-enfermedad',
  templateUrl: './nueva-enfermedad.component.html',
  styles: []
})
export class NuevaEnfermedadComponent implements OnInit {
  
  etapas:string[] = [];
  etapa:string;

  bandera:boolean = false;

  constructor() { }
  

  ngOnInit() {
  }

  addEtapa (newEtapa: string) {
    if (newEtapa) {
      this.etapas.push(newEtapa);
    }
  }

  setBandera( bandera:boolean ){
    this.bandera = !this.bandera;
  }




  

  
}

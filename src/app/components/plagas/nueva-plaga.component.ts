import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nueva-plaga',
  templateUrl: './nueva-plaga.component.html',
  styles: []
})
export class NuevaPlagaComponent implements OnInit {

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

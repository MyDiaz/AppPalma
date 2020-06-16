import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fecha',
  template: `
    <p>
      {{fecha | date:'fullDate':'es'}}
    </p>
  `,
  styles: []
})
export class FechaComponent implements OnInit {

  constructor() { }

  fecha: Date = new Date();

  ngOnInit() {
  }

}

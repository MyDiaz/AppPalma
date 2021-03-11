import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fecha',
  template: `
    <p class="mt-2 text-right">
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

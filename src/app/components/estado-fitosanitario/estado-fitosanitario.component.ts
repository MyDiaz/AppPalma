import { Component, OnInit } from '@angular/core';
import { LoteService } from '../../Servicios/lote.service'; 
//import { Router } from '@angular/router';

@Component({
  selector: 'app-estado-fitosanitario',
  templateUrl: './estado-fitosanitario.component.html',
  styleUrls: ['./estado-fitosanitario.component.css']
})
export class EstadoFitosanitarioComponent implements OnInit {
  
  enfermedades:string[] = [];

  public barChartOptions:any = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels:any[] = ['Inicial', 'Avanzada', 'Cráter'];
  public barChartType: any = 'bar';
  public barChartLegend = true;
  

  public barChartData: any[] = [
    { data: [1, 5, 6], label: 'Cantidad de palmas enfermas' },
  ];
    
   constructor(private _loteService:LoteService ){
   }
    
  ngOnInit() {
    this.enfermedades = this._loteService.getEnfermedades();
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

}

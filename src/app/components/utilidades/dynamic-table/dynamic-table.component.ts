import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit  } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TableColumn } from '../../../models/columnsDynamicTable';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit, AfterViewInit  {
   
    @Input() columns: Array<TableColumn>; //objeto conformado por el nombre de las columnas  y el nombre del campo en la base de datos
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @Input() dataSource: MatTableDataSource<any>; //listado de lo que sea (cosechas, viajes...) filtrado 
    displayedColumns: string[] = []; //nombre de las columnas obtenido a partir de columns
    @Input() mostrarPaginador:boolean;
    ////@Input() mostrarTablaDetalle:boolean;

  
    constructor() { }
  
    ngOnInit(): void {
      console.log("this.dataSource.data", this.dataSource.data)
      console.log("Columns names/columns db names: ", this.columns.map(x => x))
      this.displayedColumns = this.columns.map(x => x.columnDef);    // pre-fix static

    }
  
    updateData(dataset: Array<any>){
      this.dataSource = new MatTableDataSource<any>(dataset);
    }
  
    ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
    }
    
  
}
  

  
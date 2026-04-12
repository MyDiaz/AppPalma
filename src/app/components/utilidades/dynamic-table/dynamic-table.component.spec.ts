import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { DynamicTableComponent } from './dynamic-table.component';

describe('DynamicTableComponent', () => {
  let component: DynamicTableComponent;
  let fixture: ComponentFixture<DynamicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DynamicTableComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTableComponent);
    component = fixture.componentInstance;
    component.columns = [
      { columnDef: 'id', header: 'ID' } as any,
      { columnDef: 'name', header: 'Nombre' } as any,
    ];
    component.dataSource = new MatTableDataSource([]);
    component.mostrarPaginador = true;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map displayed columns on init', () => {
    component.ngOnInit();

    expect(component.displayedColumns).toEqual(['id', 'name']);
  });

  it('should replace the datasource when updateData is called', () => {
    component.updateData([{ id: 1 }]);

    expect(component.dataSource.data).toEqual([{ id: 1 }]);
  });

  it('should toggle selection and emit the clicked row', () => {
    const row = { id: 1 };
    const emitSpy = spyOn(component.rowSelected, 'emit');

    component.onRowClick(row);

    expect(component.selection.isSelected(row)).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(row);
  });
});

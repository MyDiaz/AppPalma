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
    component.columns = [];
    component.dataSource = new MatTableDataSource([]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

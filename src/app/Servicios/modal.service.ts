// modal.service.ts
import { Injectable } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ModalComponent } from "../modal/modal.component"; // Adjust the path
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  constructor(private dialog: MatDialog) {}

  openModal(rowData: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '600px'; // Set the width (you can use any valid CSS size)
    dialogConfig.minHeight = '400px'; 
    console.log(rowData);
    this.dialog.open(ModalComponent, {
      data: { rowData },
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }
}

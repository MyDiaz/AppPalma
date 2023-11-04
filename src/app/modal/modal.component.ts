// modal.component.ts
import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { EnfermedadesService } from "../Servicios/enfermedades.service";
import { DomSanitizer,SafeUrl  } from '@angular/platform-browser';
@Component({
  selector: "app-modal",
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
  })
export class ModalComponent implements OnInit{
  mensaje_error: string;
  observaciones: string;
  byteArrays: any[]; // Assuming this is your array of byte arrays
  imageUrls: SafeUrl[] = [];

  loading : boolean = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ModalComponent>,
    public enfermedadesService: EnfermedadesService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    console.log('this.data');
    console.log(this.data);
    this.observaciones = this.data.rowData.observacion_registro_enfermedad;
    console.log('observaciones',this.observaciones);
    this.enfermedadesService.getImagenesRegistroEnfermedad(this.data.rowData.id_registro_enfermedad).subscribe(
      (response) => {
        response.forEach(r => {
        console.log('r', r);
        // const imageUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + r.imagen.data);
        //   this.imageUrls.push(imageUrl);
        const blob = new Blob([new Uint8Array(r.imagen.data)], { type: 'image/png' });
        this.imageUrls.push(this.sanitizeUrl(URL.createObjectURL(blob)));
        });
        console.log('urls', this.imageUrls);
        this.loading = false;
      },
      (error) => {
        this.mensaje_error = error.error.message;
      }
    );
  }

  sanitizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  close() {
    // You can add any logic you need before closing the modal
    // ...
    this.dialogRef.close();
  }
}

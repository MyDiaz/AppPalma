import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { MapsAPILoader } from "@agm/core";
import { LoteService } from "../../../Servicios/lote.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-lote",
  templateUrl: "./perfil-lote.component.html",
  styleUrls: ["./perfil-lote.component.css"],
})
export class PerfilLoteComponent implements OnInit {
  kmlUrlObject: string;
  kmlUrl: string;
  lote: any = {};
  nombre_lote: string;
  bandera_error: boolean = false;
  mensaje_error: string;
  map?: google.maps.Map;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _loteService: LoteService,
    private router: Router,
    private mapsAPILoader: MapsAPILoader
  ) {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.nombre_lote = params.get("id");
    });
  }

  ngOnInit() {
    this._loteService.getLote(this.nombre_lote).subscribe(
      (data) => {
        this.lote = data;
        console.log(data);
        this.kmlUrl = this._loteService.getLoteMapaUrl(this.nombre_lote);
      },
      (error) => {
        this.bandera_error = true;
        if (error.status == 0) {
          this.mensaje_error = "Servicio no disponible";
        } else {
          this.mensaje_error = error.error.message;
          console.log("error", error);
        }
      }
    );
  }

  initMap() {
    if (!this.lote?.mapa) {
      return;
    }
    this.mapsAPILoader.load().then(() => {
      const mapElement = document.getElementById("map");
      if (!mapElement || !(window as any).google?.maps) {
        return;
      }

      this.map = new google.maps.Map(mapElement, {
        zoom: 16,
        mapTypeId: "satellite",
      });

      const layer1 = new google.maps.KmlLayer({
        url: this.kmlUrl,
        preserveViewport: true,
        map: this.map,
      });

      google.maps.event.addListener(
        layer1,
        "defaultviewport_changed",
        function () {
          const getCenter = layer1.getDefaultViewport().getCenter();
          this.map.setCenter(getCenter);
        }
      );
    });
  }

  verRegistros(donde: string) {
    this.router.navigate([donde], { queryParams: { lote: this.nombre_lote } });
  }

  verLoteEditar(nombre: string) {
    this.router.navigate(["/editar-lote", nombre]);
  }

  eliminarLote() {
    Swal.fire({
      title: "Eliminar lote",
      text: "¿Estás seguro de que quieres eliminar este lote?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.bandera_error = false;
        this._loteService.deleteLote(this.nombre_lote).subscribe(
          () => {
            Swal.fire({
              title: "Lote eliminado",
              text: "El lote se eliminó correctamente.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
            this.router.navigate(["/lotes"]);
          },
          (error) => {
            this.bandera_error = true;
            if (error.status == 0) {
              this.mensaje_error = "Servicio no disponible";
            } else {
              this.mensaje_error = error.error?.message || "No se pudo eliminar el lote";
            }
            console.error("error eliminar lote", error);
          }
        );
      }
    });
  }

  isStringEmpty(str: string | null | undefined): boolean {
    return !str?.trim();
  }
}

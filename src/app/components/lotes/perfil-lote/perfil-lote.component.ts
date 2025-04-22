import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { LoteService } from "../../../Servicios/lote.service";

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
  map: google.maps.Map<HTMLElement>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _loteService: LoteService,
    private router: Router
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
        this.initMap();
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
    if (this.lote["mapa"] == null || this.lote["mapa"] == undefined || this.lote["mapa"] == "") {
      return;
    }
    this.map = new google.maps.Map(document.getElementById("map"), {
      zoom: 16,
      mapTypeId: "satellite",
    });

    var layer1 = new google.maps.KmlLayer({
      url: this.kmlUrl,
      preserveViewport: true,
      map: this.map,
    });
    google.maps.event.addListener(
      layer1,
      "defaultviewport_changed",
      function () {
        var getCenter = layer1.getDefaultViewport().getCenter();
        this.map.setCenter(getCenter);
      }
    );
  }

  verRegistros(donde: string) {
    this.router.navigate([donde], { queryParams: { lote: this.nombre_lote } });
  }

  verLoteEditar(nombre: string) {
    this.router.navigate(["/editar-lote", nombre]);
  }

  isStringEmpty(str: string | null | undefined): boolean {
    return !str || str.trim() === '';
  }
}

import { AfterViewInit, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { LoteService } from "../../../Servicios/lote.service";
@Component({
  selector: "app-lote",
  templateUrl: "./perfil-lote.component.html",
  styleUrls: ["./perfil-lote.component.css"],
})
export class PerfilLoteComponent implements OnInit {
  kmlUrl: string;
  latitute = 6.8989732;
  longitude = -73.62945;
  mapTypeId = "satellite";
  lote: any = {};
  nombre_lote: string;
  bandera_error: boolean = false;
  mensaje_error: string;
  zoom = 16;
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
    this.kmlUrl = this._loteService.getLoteMapaUrl(this.nombre_lote);
    this.initMap();
  }

  initMap() {
    this.map = new google.maps.Map(document.getElementById("map"), {
      zoom: 10,
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
        console.log(getCenter.toUrlValue(6));
      }
    );
  }

  verRegistros(donde: string) {
    this.router.navigate([donde], { queryParams: { lote: this.nombre_lote } });
  }

  verLoteEditar(nombre: string) {
    this.router.navigate(["/editar-lote", nombre]);
  }
 
}

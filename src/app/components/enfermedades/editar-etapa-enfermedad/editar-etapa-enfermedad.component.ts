import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { EnfermedadesService } from "src/app/Servicios/enfermedades.service";
import Swal from "sweetalert2";

type EtapaEnfermedad = {
  id_etapa_enfermedad: number,
  etapa_enfermedad: string,
  nombre_enfermedad: string,
  tratamiento_etapa_enfermedad?:string,
  fue_borrado: boolean
}

@Component({
  selector: "app-editar-etapa-enfermedad",
  templateUrl: "./editar-etapa-enfermedad.component.html",
  styleUrls: ["./editar-etapa-enfermedad.component.css"],
})
export class EditarEtapaEnfermedadComponent implements OnInit {
  nombre_enfermedad: string;
  enfermedad_etapas: EtapaEnfermedad[];
  editarEnfermedadEtapaForm: FormGroup;
  cargando: boolean = false;
  error: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private enfermedadesService: EnfermedadesService
  ) {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.nombre_enfermedad = params.get("nombre_enfermedad");
    });
    this.cargando = false;
  }

  ngOnInit() {
    this.enfermedadesService
      .getEnfermedadEtapas(this.nombre_enfermedad)
      .subscribe((data: EtapaEnfermedad[]) => {
        this.enfermedad_etapas = data;
        this.crearEtapasEnfermedadForm();
        this.cargando = true;
      }
    );
  }

  crearEtapasEnfermedadForm() {
    this.editarEnfermedadEtapaForm = this.fb.group({
      ids_etapas_enfermedad: this.fb.array(
        this.enfermedad_etapas.map((a) => a.id_etapa_enfermedad)
      ),
      nombre_enfermedad: [
        `${this.nombre_enfermedad}`,
        [Validators.required, Validators.minLength(3)],
      ],
      etapas_enfermedad: this.fb.array(
        this.enfermedad_etapas.map((a) => a.etapa_enfermedad)
      ),
      tratamientos_etapa_enfermedad: this.fb.array(
        this.enfermedad_etapas.map((a) => a.tratamiento_etapa_enfermedad)
      ),
    });
  }

  get IDsEnfermedad() {
    return this.editarEnfermedadEtapaForm.get(
      "ids_etapas_enfermedad"
    ) as FormArray;
  }

  get etapasEnfermedad() {
    return this.editarEnfermedadEtapaForm.get("etapas_enfermedad") as FormArray;
  }

  get tratamientosEtapa() {
    return this.editarEnfermedadEtapaForm.get(
      "tratamientos_etapa_enfermedad"
    ) as FormArray;
  }

  addEtapa() {
    this.etapasEnfermedad.push(this.fb.control(""));
    this.tratamientosEtapa.push(this.fb.control(""));
    this.IDsEnfermedad.push(this.fb.control(-1));
  }

  borrarFila(i: number) {
    if (this.etapasEnfermedad.controls.length > 1) {
      this.etapasEnfermedad.removeAt(i);
      this.tratamientosEtapa.removeAt(i);
      this.IDsEnfermedad.removeAt(i);
      this.enfermedad_etapas.splice(i, 1);
    }
  }

  actualizarEnfermedad() {
    let valores_etapas_enfermedad = {
      ids_etapas_enfermedad:
        this.editarEnfermedadEtapaForm.value.ids_etapas_enfermedad.map(
          (ids) => {
            return ids;
          }
        ),
      nombre_enfermedad: encodeURIComponent(
        this.editarEnfermedadEtapaForm.value.nombre_enfermedad
      ),
      etapas_enfermedad:
        this.editarEnfermedadEtapaForm.value.etapas_enfermedad.map((etapas) => {
          return encodeURIComponent(etapas);
        }),
      tratamientos_etapa_enfermedad:
        this.editarEnfermedadEtapaForm.value.tratamientos_etapa_enfermedad.map(
          (tratamieto) => {
            return encodeURIComponent(tratamieto);
          }
        ),
    };
    Swal.fire({
      text: "Estás seguro de actualizar la enfermedad?",
      icon: "question",
      showCancelButton: true,
      showConfirmButton: true,
    }).then(() => {
      this.enfermedadesService
        .actualizarEnfermedadConEtapas(
          this.nombre_enfermedad,
          valores_etapas_enfermedad
        )
        .subscribe(
          (resp) => {
            let rta = resp;
            Swal.fire({
              title: decodeURIComponent(
                valores_etapas_enfermedad.nombre_enfermedad
              ),
              html: rta.message,
              icon: "success",
            }).then((value => {
              if (value.isConfirmed) {
                this.editarEnfermedadEtapaForm.reset({});
                this.router.navigateByUrl("listado-enfermedad");
              }
            }));
          },
          (error) => {
            Swal.fire({
              title: decodeURIComponent(
                valores_etapas_enfermedad.nombre_enfermedad
              ),
              html: error.error.message,
              icon: "error",
            });
          }
        );
    });
  }
}

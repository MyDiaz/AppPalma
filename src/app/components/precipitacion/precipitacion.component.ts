import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Chart } from 'chart.js';
import { PrecipitacionesService } from '../../Servicios/precipitaciones.service';

interface PrecipitacionTile {
  title: string;
  value: string;
  detail: string;
}

interface PrecipitacionRegistro {
  fecha: Date;
  milimetros: number;
}

@Component({
  selector: 'app-precipitacion',
  templateUrl: './precipitacion.component.html',
  styleUrls: ['./precipitacion.component.css']
})
export class PrecipitacionComponent implements OnInit, OnDestroy {
  bandera_error = false;
  mensaje_error = 'No se detectaron errores';
  cargando = false;

  descripcion = 'Consulta los registros de precipitaciones recientes y compara los acumulados con el promedio histórico del cultivo.';
  rangeForm = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  encontro = false;
  rangoSeleccionado = false;

  private lluviaChart: Chart | null = null;

  resumenTiles: PrecipitacionTile[] = this.obtenerTilesPorDefecto();

  // Datos de distribución semanal deshabilitados temporalmente.
  /*
  seriesSemanal = [
    { label: 'Semana 1', value: '12 mm' },
    { label: 'Semana 2', value: '18 mm' },
    { label: 'Semana 3', value: '5 mm' },
    { label: 'Semana 4', value: '22 mm' }
  ];
  */

  private registrosActuales: PrecipitacionRegistro[] = [];
  private rangeFormSubscription = new Subscription();

  constructor(private precipitacionesService: PrecipitacionesService) { }

  ngOnInit(): void {
    this.rangeFormSubscription = this.rangeForm.valueChanges.subscribe(() => {
      this.aplicarResumen();
    });

    this.obtenerPrecipitaciones();
  }

  ngOnDestroy(): void {
    this.rangeFormSubscription.unsubscribe();
  }

  private obtenerPrecipitaciones(): void {
    this.cargando = true;
    this.precipitacionesService.getPrecipitaciones().subscribe({
      next: (datos) => {
        this.registrosActuales = this.normalizarPrecipitaciones(datos);
        this.cargando = false;
        this.aplicarResumen();
      },
      error: (error) => {
        this.bandera_error = true;
        this.mensaje_error = error?.message ?? 'No se pudo cargar la información de precipitaciones.';
        this.cargando = false;
      }
    });
  }

  private aplicarResumen(): void {
    const rango = this.obtenerRangoActual();
    if (!rango) {
      this.resumenTiles = this.obtenerTilesPorDefecto();
      this.encontro = false;
      this.rangoSeleccionado = false;
      this.actualizarGraficoPrecipitacion([]);
      return;
    }

    const { inicio, fin } = rango;
    this.rangoSeleccionado = true;
    const registrosEnRango = this.filtrarRegistrosPorRango(this.registrosActuales, inicio, fin);
    const diasTotales = this.calcularDiasInclusivos(inicio, fin);
    const acumulado = registrosEnRango.reduce((sum, registro) => sum + registro.milimetros, 0);
    const diasConLluvia = registrosEnRango.filter((registro) => registro.milimetros > 0).length;
    const promedioDiario = diasTotales ? acumulado / diasTotales : 0;

    this.encontro = registrosEnRango.length > 0;
    if (this.encontro) {
      this.resumenTiles = this.construirResumenTiles(acumulado, diasConLluvia, promedioDiario, inicio, fin, diasTotales);
      setTimeout(() => this.actualizarGraficoPrecipitacion(registrosEnRango));
    } else {
      this.resumenTiles = this.obtenerTilesPorDefecto();
      this.actualizarGraficoPrecipitacion([]);
    }
  }

  private normalizarPrecipitaciones(datos: any): PrecipitacionRegistro[] {
    if (!Array.isArray(datos)) {
      return [];
    }

    return datos
      .map((registro: any) => {
        const fechaBruta =
          registro?.fecha_registro_precipitacion ??
          registro?.fecha ??
          registro?.date ??
          registro?.dia ??
          registro?.createdAt ??
          '';
        const fecha = new Date(fechaBruta);
        const milimetros = Number(
          registro?.cantidad_precipitacion ??
            registro?.milimetros ??
            registro?.valor ??
            registro?.mm ??
            registro?.precipitacion ??
            0
        );

        return {
          fecha,
          milimetros: Number.isFinite(milimetros) ? milimetros : 0
        };
      })
      .filter((registro) => !Number.isNaN(registro.fecha.getTime()));
  }

  private obtenerRangoActual(): { inicio: Date; fin: Date } | null {
    const inicioControl = this.rangeForm.get('start')?.value;
    const finControl = this.rangeForm.get('end')?.value;

    if (!inicioControl || !finControl) {
      return null;
    }

    const inicio = new Date(inicioControl);
    const fin = new Date(finControl);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      return null;
    }

    return inicio <= fin ? { inicio, fin } : { inicio: fin, fin: inicio };
  }

  private filtrarRegistrosPorRango(registros: PrecipitacionRegistro[], inicio: Date, fin: Date): PrecipitacionRegistro[] {
    const inicioUTC = inicio.getTime();
    const finUTC = fin.getTime();
    return registros.filter((registro) => {
      const tiempo = registro.fecha.getTime();
      return tiempo >= inicioUTC && tiempo <= finUTC;
    });
  }

  private calcularDiasInclusivos(inicio: Date, fin: Date): number {
    const inicioUTC = Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    const finUTC = Date.UTC(fin.getFullYear(), fin.getMonth(), fin.getDate());
    return Math.max(1, Math.floor((finUTC - inicioUTC) / 86400000) + 1);
  }

  private construirResumenTiles(
    acumulado: number,
    diasConLluvia: number,
    promedioDiario: number,
    inicio: Date,
    fin: Date,
    diasTotales: number
  ): PrecipitacionTile[] {
    const acumuladoFormateado = `${acumulado.toFixed(1)} mm`;
    const promedioFormateado = `${promedioDiario.toFixed(1)} mm`;

    return [
      {
        title: 'Acumulado mensual',
        value: acumuladoFormateado,
        detail: `Total entre ${this.formatearFecha(inicio)} y ${this.formatearFecha(fin)}`
      },
      {
        title: 'Promedio diario',
        value: promedioFormateado,
        detail: `Promedio diario considerando ${diasTotales} ${diasTotales === 1 ? 'día' : 'días'} del rango`
      },
      {
        title: 'Días con lluvia',
        value: `${diasConLluvia} días`,
        detail: 'Días con registro positivo de precipitación'
      }
    ];
  }

  private obtenerTilesPorDefecto(): PrecipitacionTile[] {
    return [
      { title: 'Acumulado mensual', value: '-- mm', detail: 'Total entre el primer y el último día seleccionado.' },
      { title: 'Promedio diario', value: '-- mm', detail: 'Promedio de las lluvias reportadas durante el rango.' },
      { title: 'Días con lluvia', value: '-- días', detail: 'Cantidad de jornadas con registro de precipitación.' }
    ];
  }

  private formatearFecha(date: Date): string {
    const opciones: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-UY', opciones);
  }

  private formatearFechaConAnio(date: Date): string {
    const opciones: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-UY', opciones);
  }

  get rangoMostrar(): string {
    const rango = this.obtenerRangoActual();
    if (!rango) {
      const inicio = this.rangeForm.get('start')?.value;
      const fin = this.rangeForm.get('end')?.value;
      return inicio || fin ? 'Completa ambos campos del rango.' : 'Selecciona un rango para ver los indicadores de precipitacin.';
    }

    return `${this.formatearFechaConAnio(rango.inicio)} - ${this.formatearFechaConAnio(rango.fin)}`;
  }

  private actualizarGraficoPrecipitacion(registros: PrecipitacionRegistro[]): void {
    const canvas = document.getElementById('chartPrecipitaciones') as HTMLCanvasElement;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    if (registros.length === 0) {
      if (this.lluviaChart) {
        this.lluviaChart.destroy();
        this.lluviaChart = null;
      }
      return;
    }

    if (this.lluviaChart) {
      this.lluviaChart.destroy();
    }

    const datosOrdenados = [...registros].sort(
      (a, b) => a.fecha.getTime() - b.fecha.getTime()
    );

    const puntos = datosOrdenados.map((registro) => ({
      x: registro.fecha,
      y: registro.milimetros,
    }));

    this.lluviaChart = new Chart(ctx, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Precipitación (mm)',
            data: puntos,
            backgroundColor: 'rgba(65, 105, 225, 0.5)',
            borderColor: 'rgb(65, 105, 225)',
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        tooltips: {
          enabled: true,
          mode: 'index',
          intersect: false,
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              distribution: 'series',
              time: {
                tooltipFormat: 'll',
                unit: 'day',
                displayFormats: {
                  day: 'DD MMM',
                },
              },
              ticks: {
                autoSkip: true,
                maxRotation: 0,
              },
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: true,
              },
            },
          ],
        },
      },
    });
  }

}

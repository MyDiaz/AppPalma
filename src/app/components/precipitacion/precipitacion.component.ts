import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { PrecipitacionesService } from '../../Servicios/precipitaciones.service';
import 'moment/locale/es';

interface PrecipitacionTile {
  title: string;
  value: string;
  detail: string;
}
interface PrecipitacionRegistro {
  fecha: Date;
  milimetros: number;
}
type Granularidad = 'dia' | 'semana' | 'mes' | 'anio';

moment.locale('es');

@Component({
  selector: 'app-precipitacion',
  templateUrl: './precipitacion.component.html',
  styleUrls: ['./precipitacion.component.css']
})
export class PrecipitacionComponent implements OnInit, OnDestroy {
  bandera_error = false;
  mensaje_error = 'No se detectaron errores';
  cargando = false;
  descripcion = 'Consulta los registros de precipitaciones recientes y compara los acumulados con el promedio hist\u00f3rico del cultivo.';
  rangeForm = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
    granularity: new FormControl('dia'),
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
        this.mensaje_error = error?.message ?? 'No se pudo cargar la informaci\u00f3n de precipitaciones.';
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
      this.actualizarGraficoPrecipitacion([], this.obtenerGranularidadSeleccionada());
      return;
    }
    const { inicio, fin } = rango;
    this.rangoSeleccionado = true;
    const registrosEnRango = this.filtrarRegistrosPorRango(this.registrosActuales, inicio, fin);
    const diasTotales = this.calcularDiasInclusivos(inicio, fin);
    const acumulado = registrosEnRango.reduce((sum, registro) => sum + registro.milimetros, 0);
    const diasConLluvia = registrosEnRango.filter((registro) => registro.milimetros > 0).length;
    const promedioDiario = diasTotales ? acumulado / diasTotales : 0;
    const granularidad = this.obtenerGranularidadSeleccionada();
    this.encontro = registrosEnRango.length > 0;
    if (this.encontro) {
      const puntosGrafico = this.generarPuntosParaGrafico(registrosEnRango, inicio, fin, granularidad);
      this.resumenTiles = this.construirResumenTiles(
        acumulado,
        diasConLluvia,
        promedioDiario,
        inicio,
        fin,
        diasTotales
      );
      setTimeout(() => this.actualizarGraficoPrecipitacion(puntosGrafico, granularidad));
    } else {
      this.resumenTiles = this.obtenerTilesPorDefecto();
      this.actualizarGraficoPrecipitacion([], granularidad);
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
        detail: `Promedio diario considerando ${diasTotales} ${diasTotales === 1 ? 'd\u00eda' : 'd\u00edas'} del rango`
      },
      {
        title: 'D\u00edas con lluvia',
        value: `${diasConLluvia} d\u00edas`,
        detail: 'D\u00edas con registro positivo de precipitaci\u00f3n'
      }
    ];
  }
  private obtenerTilesPorDefecto(): PrecipitacionTile[] {
    return [
      { title: 'Acumulado mensual', value: '-- mm', detail: 'Total entre el primer y el \u00faltimo d\u00eda seleccionado.' },
      { title: 'Promedio diario', value: '-- mm', detail: 'Promedio de las lluvias reportadas durante el rango.' },
      { title: 'D\u00edas con lluvia', value: '-- d\u00edas', detail: 'Cantidad de jornadas con registro de precipitaci\u00f3n.' }
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
      return inicio || fin ? 'Completa ambos campos del rango.' : 'Selecciona un rango para ver los indicadores de precipitaci\u00f3n.';
    }
    return `${this.formatearFechaConAnio(rango.inicio)} - ${this.formatearFechaConAnio(rango.fin)}`;
  }
  private actualizarGraficoPrecipitacion(
    puntos: { x: Date; y: number }[],
    granularidad: Granularidad
  ): void {
    const canvas = document.getElementById('chartPrecipitaciones') as HTMLCanvasElement;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    if (!puntos.length) {
      if (this.lluviaChart) {
        this.lluviaChart.destroy();
        this.lluviaChart = null;
      }
      return;
    }
    if (this.lluviaChart) {
      this.lluviaChart.destroy();
    }
    const datosOrdenados = [...puntos].sort((a, b) => a.x.getTime() - b.x.getTime());
    const unidadTiempo = this.obtenerUnidadTiempo(granularidad);
    const obtenerFechaDesdeTooltip = (tooltipItem?: Chart.ChartTooltipItem): Date | null => {
      if (!tooltipItem) {
        return null;
      }
      const index = tooltipItem.index;
      if (typeof index === 'number') {
        const punto = datosOrdenados[index];
        if (punto) {
          const valor = punto.x;
          const fecha = valor instanceof Date ? valor : new Date(valor);
          return Number.isNaN(fecha.getTime()) ? null : fecha;
        }
      }
      if (tooltipItem.xLabel) {
        const fecha = new Date(tooltipItem.xLabel);
        if (!Number.isNaN(fecha.getTime())) {
          return fecha;
        }
      }
      return null;
    };
    this.lluviaChart = new Chart(ctx, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Precipitaci\u00f3n (mm)',
            data: datosOrdenados,
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
          callbacks: {
            title: (tooltipItems) => {
              if (!tooltipItems.length) {
                return '';
              }
              const fecha = obtenerFechaDesdeTooltip(tooltipItems[0]);
              return fecha ? moment(fecha).format('LL') : '';
            },
          },
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              distribution: 'series',
              time: {
                tooltipFormat: 'll',
                unit: unidadTiempo,
                displayFormats: {
                  day: 'DD MMM',
                  week: 'DD MMM',
                  month: 'MMM YYYY',
                  year: 'YYYY',
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
  private generarPuntosParaGrafico(
    registros: PrecipitacionRegistro[],
    inicio: Date,
    fin: Date,
    granularidad: Granularidad
  ): { x: Date; y: number }[] {
    const lineaTiempo = this.generarLineaTiempo(inicio, fin, granularidad);
    const acumuladoPorUnidad = new Map<number, number>();
    registros.forEach((registro) => {
      const fechaNormalizada = this.normalizarFechaPorGranularidad(registro.fecha, granularidad);
      const clave = fechaNormalizada.getTime();
      acumuladoPorUnidad.set(clave, (acumuladoPorUnidad.get(clave) ?? 0) + registro.milimetros);
    });
    return lineaTiempo.map((unidad) => ({
      x: unidad.fecha,
      y: acumuladoPorUnidad.get(unidad.key) ?? 0,
    }));
  }
  private generarLineaTiempo(
    inicio: Date,
    fin: Date,
    granularidad: Granularidad
  ): { key: number; fecha: Date }[] {
    const linea: { key: number; fecha: Date }[] = [];
    let cursor = this.normalizarFechaPorGranularidad(inicio, granularidad);
    const finTime = fin.getTime();
    while (cursor.getTime() <= finTime) {
      linea.push({ key: cursor.getTime(), fecha: new Date(cursor) });
      cursor = this.avanzarUnidad(cursor, granularidad);
    }
    return linea;
  }
  private normalizarFechaPorGranularidad(fecha: Date, granularidad: Granularidad): Date {
    const normalizada = new Date(fecha);
    normalizada.setHours(0, 0, 0, 0);
    switch (granularidad) {
      case 'dia':
        return normalizada;
      case 'semana':
        return this.obtenerInicioSemana(normalizada);
      case 'mes':
        normalizada.setDate(1);
        return normalizada;
      case 'anio':
        normalizada.setDate(1);
        normalizada.setMonth(0);
        return normalizada;
    }
    return normalizada;
  }
  private avanzarUnidad(fecha: Date, granularidad: Granularidad): Date {
    const siguiente = new Date(fecha);
    switch (granularidad) {
      case 'dia':
        siguiente.setDate(siguiente.getDate() + 1);
        break;
      case 'semana':
        siguiente.setDate(siguiente.getDate() + 7);
        break;
      case 'mes':
        siguiente.setMonth(siguiente.getMonth() + 1);
        siguiente.setDate(1);
        break;
      case 'anio':
        siguiente.setFullYear(siguiente.getFullYear() + 1);
        siguiente.setMonth(0);
        siguiente.setDate(1);
        break;
    }
    siguiente.setHours(0, 0, 0, 0);
    return siguiente;
  }
  private obtenerInicioSemana(fecha: Date): Date {
    const inicio = new Date(fecha);
    const dia = inicio.getDay();
    const desplazamiento = (dia + 6) % 7;
    inicio.setDate(inicio.getDate() - desplazamiento);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  }
  private obtenerGranularidadSeleccionada(): Granularidad {
    const valor = this.rangeForm.get('granularity')?.value as Granularidad;
    return valor ?? 'dia';
  }
  private obtenerUnidadTiempo(granularidad: Granularidad): 'day' | 'week' | 'month' | 'year' {
    switch (granularidad) {
      case 'semana':
        return 'week';
      case 'mes':
        return 'month';
      case 'anio':
        return 'year';
      default:
        return 'day';
    }
  }
}

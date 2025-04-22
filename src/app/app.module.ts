import { BrowserModule } from "@angular/platform-browser";
import { NgModule, LOCALE_ID } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeEs from "@angular/common/locales/es";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

//graficos
import { ChartsModule } from "ng2-charts";

//rutas
import { APP_ROUTING } from "./app.router";

//servicios
import { LoteService } from "./Servicios/lote.service";
import { AuthInterceptor } from "./Servicios/auth.service";

//components
import { AppComponent } from "./app.component";
import { PerfilLoteComponent } from "./components/lotes/perfil-lote/perfil-lote.component";
import { LotesComponent } from "./components/lotes/lotes.component";
import { NavbarComponent } from "./components/shared/navbar/navbar.component";
import { PalmaComponent } from "./components/palma/palma.component";
import { EstadoFitosanitarioComponent } from "./components/estado-fitosanitario/estado-fitosanitario.component";
import { EstadoProductivoComponent } from "./components/estado-productivo/estado-productivo.component";
import { RegistroPlagasComponent } from "./components/plagas/registro-plagas.component";
import { AplicacionesComponent } from "./components/aplicaciones/aplicaciones.component";
import { FechaComponent } from "./components/utilidades/fecha/fecha.component";
import { NuevoLoteComponent } from "./components/lotes/nuevo-lote/nuevo-lote.component";
import { NuevaPlagaComponent } from "./components/plagas/nueva-plaga.component";
import { ListadoPlagasComponent } from "./components/plagas/listado-plagas.component";
import { ListadoAgroquimicosComponent } from "./components/aplicaciones/listado-agroquimicos.component";
import { NuevoAgroquimicosComponent } from "./components/aplicaciones/nuevo-agroquimicos.component";
import { NuevaEnfermedadComponent } from "./components/enfermedades/nueva-enfermedad/nueva-enfermedad.component";
import { ListadoEnfermedadesComponent } from "./components/enfermedades/listado-enfermedades.component";
import { FormularioEnfermedadComponent } from "./components/enfermedades/formulario-enfermedad/formulario-enfermedad.component";

//acceso
import { RegistroComponent } from "./components/usuarios/registro/registro.component";
import { LoginComponent } from "./acceso/login/login.component";
import { UsuariosComponent } from "./components/usuarios/usuarios.component";
import { RendimientoProductivoComponent } from "./components/rendimiento-productivo/rendimiento-productivo.component";
import { FormularioLoteComponent } from "./components/lotes/formulario-lote/formulario-lote.component";
import { EditarLoteComponent } from "./components/lotes/editar-lote/editar-lote.component";
import { EditarEnfermedadComponent } from "./components/enfermedades/editar-enfermedad/editar-enfermedad.component";
import { EditarEtapaEnfermedadComponent } from "./components/enfermedades/editar-etapa-enfermedad/editar-etapa-enfermedad.component";
import { CosechasComponent } from "./components/cosechas/cosechas.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatPaginatorModule } from "@angular/material/paginator";
import { DynamicTableComponent } from "./components/utilidades/dynamic-table/dynamic-table.component";
import { PodasComponent } from "./components/podas/podas.component";
import { PlateosComponent } from "./components/plateos/plateos.component";
import { MatSelectModule } from "@angular/material/select";
import { ViajesComponent } from "./components/viajes/viajes.component";
import { CensosComponent } from "./components/censos/censos.component";
import { HistoricoEnfermedadesComponent } from "./components/enfermedades/historico-enfermedades/historico-enfermedades.component";
//import { HistoricoPlagasComponent } from './components/plagas/historico-plagas/historico-plagas.component';
import { AgmCoreModule } from "@agm/core";
import { MatCardModule } from "@angular/material/card";
import { DatePipe } from "@angular/common";
import { MatExpansionModule } from "@angular/material/expansion";
import { ModalComponent } from "./modal/modal.component";
import { CensoProductivoComponent } from "./components/censo-productivo/censo-productivo.component";
import { ListadoUsuariosComponent } from "./components/usuarios/listado-usuarios/listado-usuarios.component";
import { environment } from "src/environments/environment";

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    PerfilLoteComponent,
    LotesComponent,
    NavbarComponent,
    PalmaComponent,
    EstadoFitosanitarioComponent,
    EstadoProductivoComponent,
    RegistroPlagasComponent,
    AplicacionesComponent,
    FechaComponent,
    NuevoLoteComponent,
    NuevaPlagaComponent,
    ListadoPlagasComponent,
    ListadoAgroquimicosComponent,
    NuevoAgroquimicosComponent,
    NuevaEnfermedadComponent,
    ListadoEnfermedadesComponent,
    FormularioEnfermedadComponent,
    RegistroComponent,
    LoginComponent,
    UsuariosComponent,
    RendimientoProductivoComponent,
    FormularioLoteComponent,
    EditarLoteComponent,
    EditarEnfermedadComponent,
    EditarEtapaEnfermedadComponent,
    CosechasComponent,
    DynamicTableComponent,
    PodasComponent,
    PlateosComponent,
    ViajesComponent,
    CensosComponent,
    //,HistoricoPlagasComponent
    HistoricoEnfermedadesComponent,
    ModalComponent,
    CensoProductivoComponent,
    ListadoUsuariosComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    APP_ROUTING,
    HttpClientModule,
    ChartsModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatCheckboxModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatRadioModule,
    MatPaginatorModule,
    MatSelectModule,
    MatExpansionModule,
    AgmCoreModule.forRoot({
      apiKey: environment.agmApiKey,
      libraries: ["places"],
    }),
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: LOCALE_ID,
      useValue: "es",
    },
    LoteService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//graficos
import { ChartsModule } from 'ng2-charts';

//rutas
import { APP_ROUTING } from './app.router';

//servicios
import { LoteService } from './Servicios/lote.service';


//components
import { AppComponent } from './app.component';
import { PerfilLoteComponent } from './components/lotes/perfil-lote/perfil-lote.component';
import { LotesComponent } from './components/lotes/lotes.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { PalmaComponent } from './components/palma/palma.component';
import { EstadoFitosanitarioComponent } from './components/estado-fitosanitario/estado-fitosanitario.component';
import { EstadoProductivoComponent } from './components/estado-productivo/estado-productivo.component';
import { RegistroPlagasComponent } from './components/plagas/registro-plagas.component';
import { AplicacionesComponent } from './components/aplicaciones/aplicaciones.component';
import { FechaComponent } from './components/utilidades/fecha/fecha.component';
import { NuevoLoteComponent } from './components/lotes/nuevo-lote/nuevo-lote.component';
import { NuevaPlagaComponent } from './components/plagas/nueva-plaga.component';
import { ListadoPlagasComponent } from './components/plagas/listado-plagas.component';
import { ListadoAgroquimicosComponent } from './components/aplicaciones/listado-agroquimicos.component';
import { NuevoAgroquimicosComponent } from './components/aplicaciones/nuevo-agroquimicos.component';
import { RegistroEnfermedadesComponent } from './components/enfermedades/registro-enfermedades.component';
import { ListadoEnfermedadesComponent } from './components/enfermedades/listado-enfermedades.component';
import { NuevaEnfermedadComponent } from './components/enfermedades/nueva-enfermedad.component';

//acceso
import { RegistroComponent } from './acceso/registro/registro.component';
import { LoginComponent } from './acceso/login/login.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { RendimientoProductivoComponent } from './components/rendimiento-productivo/rendimiento-productivo.component';
import { FormularioLoteComponent } from './components/lotes/formulario-lote/formulario-lote.component';
import { EditarLoteComponent } from './components/lotes/editar-lote/editar-lote.component';

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
    RegistroEnfermedadesComponent,
    ListadoEnfermedadesComponent,
    NuevaEnfermedadComponent,
    RegistroComponent,
    LoginComponent,
    UsuariosComponent,
    RendimientoProductivoComponent,
    FormularioLoteComponent,
    EditarLoteComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    APP_ROUTING,
    HttpClientModule,
    ChartsModule
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'es'
    },
    LoteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

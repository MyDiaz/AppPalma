import { RouterModule, Routes } from '@angular/router';
//import { HomeComponent } from './components/home/home.component';
import { LotesComponent } from './components/lotes/lotes.component';
import { LoteComponent } from './components/lote/lote.component';
import { NuevoLoteComponent } from './components/lotes/nuevo-lote.component';
import { ListadoPlagasComponent } from './components/plagas/listado-plagas.component';
import { ListadoAgroquimicosComponent } from './components/aplicaciones/listado-agroquimicos.component';
import { ListadoEnfermedadesComponent } from './components/enfermedades/listado-enfermedades.component';
import { RendimientoProductivoComponent } from './components/rendimiento-productivo/rendimiento-productivo.component';
//rutas hijas
import { EstadoFitosanitarioComponent } from './components/estado-fitosanitario/estado-fitosanitario.component';
import { EstadoProductivoComponent } from './components/estado-productivo/estado-productivo.component';
import { AplicacionesComponent } from './components/aplicaciones/aplicaciones.component';
import { RegistroPlagasComponent } from './components/plagas/registro-plagas.component';
import { NuevaPlagaComponent } from './components/plagas/nueva-plaga.component';
import { NuevoAgroquimicosComponent } from './components/aplicaciones/nuevo-agroquimicos.component';
import { NuevaEnfermedadComponent } from './components/enfermedades/nueva-enfermedad.component';
//rutas para el acceso
import { RegistroComponent } from './acceso/registro/registro.component';
import { LoginComponent } from './acceso/login/login.component';
import { AuthGuard } from './guards/auth.guard';
//usuarios
import { UsuariosComponent} from './components/usuarios/usuarios.component';

const APP_ROUTES: Routes = [
    //{ path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
    { path: 'lotes', component: LotesComponent},
    { path: 'nuevo-lote', component: NuevoLoteComponent },
    { path: 'lote/:?id', component: LoteComponent,
      children: [
        { path: 'estado-productivo', component: EstadoProductivoComponent },
        { path: 'aplicaciones', component: AplicacionesComponent },
        { path: 'registros-plagas', component: RegistroPlagasComponent }
    ]},
    { path: 'estado-fitosanitario', component: EstadoFitosanitarioComponent},
    { path: 'listado-plaga',component: ListadoPlagasComponent,
      children: [
        { path: 'nueva-plaga', component: NuevaPlagaComponent}
    ]},
    { path: 'listado-agroquimico',component: ListadoAgroquimicosComponent,
      children:[
        { path: 'nuevo-agroquimico', component: NuevoAgroquimicosComponent}
    ]},
    { path: 'listado-enfermedad', component: ListadoEnfermedadesComponent,
      children:[
        { path: 'nueva-enfermedad', component: NuevaEnfermedadComponent}
    ]},
    { path: 'rendimiento-productivo', component: RendimientoProductivoComponent},
    { path: 'registro', component: RegistroComponent },
    { path: 'login'   , component: LoginComponent},
    { path: 'usuario', component: UsuariosComponent},
    { path: '**', pathMatch: 'full', redirectTo: 'login'}
    
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES);
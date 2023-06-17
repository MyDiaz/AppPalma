import { RouterModule, Routes } from '@angular/router';

//Lotes
import { LotesComponent } from './components/lotes/lotes.component';
import { PerfilLoteComponent } from './components/lotes/perfil-lote/perfil-lote.component';
import { NuevoLoteComponent } from './components/lotes/nuevo-lote/nuevo-lote.component';
import { EditarLoteComponent } from './components/lotes/editar-lote/editar-lote.component';

import { ListadoPlagasComponent } from './components/plagas/listado-plagas.component';
import { ListadoAgroquimicosComponent } from './components/aplicaciones/listado-agroquimicos.component';
import { ListadoEnfermedadesComponent } from './components/enfermedades/listado-enfermedades.component';
import { RendimientoProductivoComponent } from './components/rendimiento-productivo/rendimiento-productivo.component';
import { EstadoFitosanitarioComponent } from './components/estado-fitosanitario/estado-fitosanitario.component';
import { EstadoProductivoComponent } from './components/estado-productivo/estado-productivo.component';
import { AplicacionesComponent } from './components/aplicaciones/aplicaciones.component';
import { RegistroPlagasComponent } from './components/plagas/registro-plagas.component';
import { NuevaPlagaComponent } from './components/plagas/nueva-plaga.component';
import { NuevoAgroquimicosComponent } from './components/aplicaciones/nuevo-agroquimicos.component';
import { NuevaEnfermedadComponent } from './components/enfermedades/nueva-enfermedad/nueva-enfermedad.component';
import { EditarEnfermedadComponent } from './components/enfermedades/editar-enfermedad/editar-enfermedad.component';
import { CosechasComponent } from './components/cosechas/cosechas.component';
import { PodasComponent } from './components/podas/podas.component';
import { PlateosComponent } from './components/plateos/plateos.component';
import { ViajesComponent } from './components/viajes/viajes.component';
import { CensosComponent } from './components/censos/censos.component';
import { HistoricoEnfermedadesComponent } from './components/enfermedades/historico-enfermedades/historico-enfermedades.component'
//rutas para el acceso
import { RegistroComponent } from './acceso/registro/registro.component';
import { LoginComponent } from './acceso/login/login.component';

//usuarios
import { UsuariosComponent} from './components/usuarios/usuarios.component';
import { EditarEtapaEnfermedadComponent } from './components/enfermedades/editar-etapa-enfermedad/editar-etapa-enfermedad.component';

//guardias
import { AuthGuard } from '../app/acceso/guardias/auth.guard'
const APP_ROUTES: Routes = [
    { path: 'registro', component: RegistroComponent },
    { path: 'login'   , component: LoginComponent},
    { path: 'lotes', component: LotesComponent, canActivate: [AuthGuard]},
    { path: 'nuevo-lote', component: NuevoLoteComponent, canActivate: [AuthGuard]},
    { path: 'editar-lote/:id', component: EditarLoteComponent, canActivate: [AuthGuard]},
    { path: 'lote/:id', component: PerfilLoteComponent, canActivate: [AuthGuard]},  
    { path: 'lote/:id/estado-productivo', component: EstadoProductivoComponent, canActivate: [AuthGuard] },
    { path: 'lote/:id/aplicaciones', component: AplicacionesComponent, canActivate: [AuthGuard] },
    { path: 'lote/:id/registros-plagas', component: RegistroPlagasComponent, canActivate: [AuthGuard] },
    { path: 'estado-fitosanitario', component: EstadoFitosanitarioComponent, canActivate: [AuthGuard]},
    { path: 'listado-plagas',component: ListadoPlagasComponent, canActivate: [AuthGuard]},
    { path: 'nueva-plaga', component: NuevaPlagaComponent, canActivate: [AuthGuard]},
    { path: 'nueva-plaga/:nombre_comun_plaga', component: NuevaPlagaComponent, canActivate: [AuthGuard]},
    { path: 'listado-agroquimicos',component: ListadoAgroquimicosComponent, canActivate: [AuthGuard]},  
    { path: 'nuevo-agroquimico', component: NuevoAgroquimicosComponent, canActivate: [AuthGuard]},
    { path: 'nuevo-agroquimico/:id_producto_agroquimico', component: NuevoAgroquimicosComponent, canActivate: [AuthGuard]}, 
    { path: 'listado-enfermedad', component: ListadoEnfermedadesComponent, canActivate: [AuthGuard]},
    { path: 'editar-enfermedad/:nombre_enfermedad', component: EditarEnfermedadComponent, canActivate: [AuthGuard]},
    { path: 'editar-etapa-enfermedad/:nombre_enfermedad', component: EditarEtapaEnfermedadComponent, canActivate: [AuthGuard]},    
    { path: 'nueva-enfermedad', component: NuevaEnfermedadComponent, canActivate: [AuthGuard] },
    { path: 'rendimiento-productivo', component: RendimientoProductivoComponent, canActivate: [AuthGuard]},
    { path: 'cosechas', component: CosechasComponent, canActivate: [AuthGuard]},
    { path: 'podas', component: PodasComponent, canActivate: [AuthGuard]},
    { path: 'plateos', component: PlateosComponent, canActivate: [AuthGuard]},
    { path: 'viajes', component: ViajesComponent, canActivate: [AuthGuard]},
    { path: 'censos', component: CensosComponent, canActivate: [AuthGuard]},
    { path: 'registro-enfermedades', component: HistoricoEnfermedadesComponent, canActivate: [AuthGuard]},
    { path: 'usuario', component: UsuariosComponent, canActivate: [AuthGuard]},
    { path: '**', pathMatch: 'full', redirectTo: 'login'}
    
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES);
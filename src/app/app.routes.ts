// src/app/app.routes.ts

import { Routes } from '@angular/router';

// Importamos solo los componentes que realmente tenemos en este momento:
import { FormularioSolicitudComponent } from './pages/solicitudes-aduana/formulario-solicitud/formulario-solicitud';
import { InicioComponent } from './pages/inicio/inicio';

/**
 * Nota: Hemos comentado (o eliminado) las rutas de listado y detalle 
 * porque aún no tienes esos componentes creados. Si llegas a crear más adelante 
 * 'ListadoSolicitudesAduanaComponent' o 'DetalleSolicitudAduanaComponent', simplemente 
 * los vuelves a descomentar y agregas aquí.
 */
export const routes: Routes = [
  // Página de inicio con las opciones disponibles
  { path: '', component: InicioComponent },

  // Ruta para crear nueva solicitud
  { path: 'solicitud/nuevo/viaje-menor', component: FormularioSolicitudComponent },

  // 3) Editar una solicitud (usa el mismo componente de formulario)
  { path: 'solicitud-aduana/editar/:id', component: FormularioSolicitudComponent },

  // 4) Cualquier otra URL → Volver al inicio
  { path: '**', redirectTo: '' }
];

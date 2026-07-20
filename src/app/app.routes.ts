import { Routes } from '@angular/router';
import { authGuard } from './core/guards/authGuard';
import { superAdminGuard } from './core/guards/superAdminGuard'
import { LayoutComponent } from './shared/ui/layout/layout';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/authRoutes').then(m => m.authRoutes)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./features/home/homeRoutes').then(m => m.homeRoutes)
      },
      {
        path: 'staff-registration',
        loadChildren: () =>
          import('./features/staff-registration/staffRegistrationRoutes')
            .then(m => m.staffRegistrationRoutes)
      },
      {
  path: 'institutional-information',
  loadChildren: () =>
    import('./features/institutional-information/institutionalInformationRoutes')
      .then(m => m.institutionalInformationRoutes)
}
    ]
  },
  {
    // Fuera de LayoutComponent: esta sección trae su propio
    // encabezado y sidebar (no el header/nav compartido). Mismo
    // patrón que LayoutComponent arriba: AdminLayoutComponent pone
    // el shell (sidebar + header) y las pantallas de admin se
    // cargan dentro de su <router-outlet>.
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, superAdminGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/admin/manager/managerRoutes').then(m => m.managerRoutes)
      },
      {
        path: 'instituciones',
        loadChildren: () =>
          import('./features/admin/institutions/institutionsRoutes').then(m => m.institutionsRoutes)
      },
      {
        path: 'enlaces',
        loadChildren: () =>
          import('./features/admin/enlaces-academicos/enlacesRoutes').then(m => m.enlacesRoutes)
      },
      {
        path: 'bitacoras',
        loadChildren: () =>
          import('./features/admin/bitacoras/bitacorasRoutes').then(m => m.bitacorasRoutes)
      },
      {
      path: 'periodos',
      loadChildren: () =>
      import('./features/admin/periods/periodsRoutes')
      .then(m => m.periodsRoutes)
      }
    
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
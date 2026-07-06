import { Routes } from '@angular/router';

export const institutionsRoutes: Routes = [
  {
    /* Vista inicial del módulo: concentrado de instituciones registradas. */
    path: '',
    loadComponent: () =>
      import('./institutions-records').then(
        m => m.InstitutionRecordsComponent
      )
  },
  {
    /* Alta de una nueva institución. */
    path: 'nueva',
    loadComponent: () =>
      import('./institution-create/institution-create').then(
        m => m.InstitutionCreateComponent
      )
  },
  {
    /* Edición de una institución existente. Mismo componente que
    el alta: el :id le indica que debe cargar y actualizar en
    vez de crear. */
    path: ':id/editar',
    loadComponent: () =>
      import('./institution-create/institution-create').then(
        m => m.InstitutionCreateComponent
      )
  }
];

import { Routes } from '@angular/router';

export const periodsRoutes: Routes = [
  {
    /* Vista principal del módulo:
    concentrado de periodos registrados. */
    path: '',
    loadComponent: () =>
      import('./periods-records').then(
        m => m.PeriodsRecordsComponent
      )
  },
  {
    /* Alta de un nuevo periodo. */
    path: 'nuevo',
    loadComponent: () =>
      import('./period-create/period-create').then(
        m => m.PeriodCreateComponent
      )
  },
  {
    /* Edición de un periodo existente.
    El :id permite cargar el registro seleccionado. */
    path: ':id/editar',
    loadComponent: () =>
      import('./period-create/period-create').then(
        m => m.PeriodCreateComponent
      )
  }
];
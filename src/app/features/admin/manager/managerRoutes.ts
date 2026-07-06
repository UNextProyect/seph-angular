import { Routes } from '@angular/router';

export const managerRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./manager').then(m => m.ManagerComponent)
  }
];
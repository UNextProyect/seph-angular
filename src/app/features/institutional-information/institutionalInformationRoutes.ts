import { Routes } from '@angular/router';

export const institutionalInformationRoutes: Routes = [
  {
    /*
     * Visualización y comparación de
     * los registros institucionales.
     */
    path: '',
    data: {
      view: 'comparison'
    },
    loadComponent: () =>
      import('./institutional-information').then(
        m => m.InstitutionalInformationComponent
      )
  },
  {
    /*
     * Flujo de captura de la
     * información institucional.
     */
    path: 'nuevo',
    data: {
      view: 'capture'
    },
    loadComponent: () =>
      import('./institutional-information').then(
        m => m.InstitutionalInformationComponent
      )
  }
];
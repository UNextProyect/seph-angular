import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../../../core/services/catalogs/catalog.service';
import { PeriodResponse } from '../../../shared/models/catalogs/responses/periodResponse';

/* Concentrado de periodos registrados.
Muestra todos los periodos y permite consultar detalle,
editar, activar o desactivar un registro.
Se utilizan signals porque la aplicación es zoneless. */
@Component({
  selector: 'app-periods-records',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './periods-records.html',
  styleUrl: './periods-records.scss'
})
export class PeriodsRecordsComponent implements OnInit {

  private readonly catalogService = inject(CatalogService);

  registros = signal<PeriodResponse[]>([]);

  isLoading = signal(false);

  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

  /* Periodo seleccionado para mostrar en la modal de detalle. */
  selectedRegistro = signal<PeriodResponse | null>(null);

  ngOnInit(): void {
    this.loadRegistros();
  }

  /* Carga todos los periodos registrados en el catálogo. */
  loadRegistros(): void {
    this.isLoading.set(true);

    this.catalogService.getPeriods().subscribe({
      next: (response) => {
        this.registros.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando periodos:', error);

        this.showNotification(
          'No fue posible cargar el concentrado de periodos.',
          'error'
        );

        this.isLoading.set(false);
      }
    });
  }

  /* Abre la modal con la información del periodo seleccionado. */
  openDetalle(registro: PeriodResponse): void {
    this.selectedRegistro.set(registro);
  }

  closeDetalle(): void {
    this.selectedRegistro.set(null);
  }

  /* Desactiva un periodo sin eliminarlo físicamente. */
  desactivar(registro: PeriodResponse): void {
    const confirmado = confirm(
      `¿Desactivar el periodo "${registro.strNombre}"?`
    );

    if (!confirmado) {
      return;
    }

    this.changeStatus(registro, false);
  }

  /* Reactiva un periodo previamente desactivado. */
  reactivar(registro: PeriodResponse): void {
    const confirmado = confirm(
      `¿Reactivar el periodo "${registro.strNombre}"?`
    );

    if (!confirmado) {
      return;
    }

    this.changeStatus(registro, true);
  }

  /* Envía al backend el nuevo estado del periodo. */
  private changeStatus(
    registro: PeriodResponse,
    bitActivo: boolean
  ): void {
    this.catalogService.changePeriodStatus(
      registro.id,
      { bitActivo }
    ).subscribe({
      next: (response) => {
        if (response.statusCode !== 200) {
          this.showNotification(
            response.message ??
              'No fue posible cambiar el estado del periodo.',
            'error'
          );
          return;
        }

        const message = bitActivo
          ? 'Periodo reactivado correctamente.'
          : 'Periodo desactivado correctamente.';

        this.showNotification(message, 'success');
        this.loadRegistros();
      },
      error: (error) => {
        console.error(
          'Error al cambiar el estado del periodo:',
          error
        );

        this.showNotification(
          error?.error?.message ??
            'No fue posible cambiar el estado del periodo.',
          'error'
        );
      }
    });
  }

  private showNotification(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.notificationMessage.set(message);
    this.notificationType.set(type);

    setTimeout(() => {
      this.notificationMessage.set('');
    }, 4000);
  }
}
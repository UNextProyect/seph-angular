import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { StaffRegistrationService } from '../../../core/services/staff-registration/staff-registration.service';
import { RegistroPersonalResponse }
from '../../../shared/models/staff-registration/responses/registroPersonalResponse';

/* Concentrado de Registros de Personal.
Muestra en una tabla los registros capturados por el usuario
(empleado + historial de contrato) y permite iniciar
un nuevo registro desde el botón correspondiente.
Nota: se usan signals porque la aplicación es zoneless;
con campos normales la vista no se actualiza al llegar la respuesta. */
@Component({
  selector: 'app-records-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './records-summary.html',
  styleUrl: './records-summary.scss'
})
export class RecordsSummaryComponent implements OnInit {

  private staffRegistrationService = inject(StaffRegistrationService);

  registros = signal<RegistroPersonalResponse[]>([]);

  isLoading = signal(false);

  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

  /* Registro seleccionado para mostrar en la modal de Detalle.
  null cuando la modal está cerrada. */
  selectedRegistro = signal<RegistroPersonalResponse | null>(null);

  ngOnInit(): void {
    this.loadRegistros();
  }

  /* Abre la modal de Detalle con el registro seleccionado. */
  openDetalle(registro: RegistroPersonalResponse): void {
    this.selectedRegistro.set(registro);
  }

  closeDetalle(): void {
    this.selectedRegistro.set(null);
  }

  /* Texto de los perfiles académicos para la modal de Detalle. */
  perfilesAcademicosTexto(registro: RegistroPersonalResponse): string {
    return registro.perfilesAcademicos.length > 0
      ? registro.perfilesAcademicos.join(', ')
      : '—';
  }

  /* Carga el concentrado de registros del usuario autenticado. */
  loadRegistros(): void {
    this.isLoading.set(true);

    this.staffRegistrationService.getRegistros().subscribe({
      next: (response) => {
        this.registros.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando registros:', error);

        this.showNotification(
          'No fue posible cargar el concentrado de registros.',
          'error'
        );

        this.isLoading.set(false);
      }
    });
  }

  /* Nombre completo del empleado para mostrar en la tabla. */
  fullName(registro: RegistroPersonalResponse): string {
    return `${registro.strNombre} ${registro.strApellidoPat} ${registro.strApellidoMat}`.trim();
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

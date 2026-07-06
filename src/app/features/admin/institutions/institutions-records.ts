import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { InstitutionsService } from '../../../core/services/institutions/institutions-service';
import { InstitutionsResponse } from '../../../shared/models/institutions/institutionsResponse';

/* Concentrado de Instituciones de Educación Superior.
Muestra en una tabla las instituciones registradas en el sistema.
Nota: se usan signals porque la aplicación es zoneless;
con campos normales la vista no se actualiza al llegar la respuesta. */
@Component({
    selector: 'app-institutions-records',
    standalone: true,
    imports: [RouterLink, DatePipe],
    templateUrl: './institutions-records.html',
    styleUrl: './institutions-records.scss'
})
export class InstitutionRecordsComponent implements OnInit {

    private readonly institutionsService = inject(InstitutionsService);

    registros = signal<InstitutionsResponse[]>([]);

    isLoading = signal(false);

    notificationMessage = signal('');
    notificationType = signal<'success' | 'error'>('success');

    /* Institución seleccionada para mostrar en la modal de Detalle.
    null cuando la modal está cerrada. */
    selectedRegistro = signal<InstitutionsResponse | null>(null);

    ngOnInit(): void {
        this.loadRegistros();
    }

    /* Carga el concentrado de instituciones registradas. */
    loadRegistros(): void {
        this.isLoading.set(true);

        this.institutionsService.getInstitutions().subscribe({
            next: (response) => {
                this.registros.set(response.data ?? []);
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Error cargando instituciones:', error);

                this.showNotification(
                    'No fue posible cargar el concentrado de instituciones.',
                    'error'
                );

                this.isLoading.set(false);
            }
        });
    }

    /* Abre la modal de Detalle con la institución seleccionada. */
    openDetalle(registro: InstitutionsResponse): void {
        this.selectedRegistro.set(registro);
    }

    closeDetalle(): void {
        this.selectedRegistro.set(null);
    }

    /* Desactiva una institución (no se elimina el registro).
    Pide confirmación porque es una acción destructiva de negocio:
    deja de estar disponible para asignarse a nuevo personal. */
    desactivar(registro: InstitutionsResponse): void {
        const confirmado = confirm(
            `¿Desactivar "${registro.strNombre}"? Ya no estará disponible para nuevos registros.`
        );

        if (!confirmado) {
            return;
        }

        this.institutionsService.deactivateInstitution(registro.id).subscribe({
            next: (response) => {
                if (response.statusCode !== 200) {
                    this.showNotification(
                        response.message ?? 'No fue posible desactivar la institución.',
                        'error'
                    );
                    return;
                }

                this.showNotification('Institución desactivada correctamente.', 'success');
                this.loadRegistros();
            },
            error: (error) => {
                console.error('Error al desactivar institución:', error);

                this.showNotification(
                    error?.error?.message ?? 'No fue posible desactivar la institución.',
                    'error'
                );
            }
        });
    }

    /* Reactiva una institución previamente desactivada, para que
    vuelva a estar disponible para asignarse a nuevo personal. */
    reactivar(registro: InstitutionsResponse): void {
        const confirmado = confirm(`¿Reactivar "${registro.strNombre}"?`);

        if (!confirmado) {
            return;
        }

        this.institutionsService.reactivateInstitution(registro.id).subscribe({
            next: (response) => {
                if (response.statusCode !== 200) {
                    this.showNotification(
                        response.message ?? 'No fue posible reactivar la institución.',
                        'error'
                    );
                    return;
                }

                this.showNotification('Institución reactivada correctamente.', 'success');
                this.loadRegistros();
            },
            error: (error) => {
                console.error('Error al reactivar institución:', error);

                this.showNotification(
                    error?.error?.message ?? 'No fue posible reactivar la institución.',
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

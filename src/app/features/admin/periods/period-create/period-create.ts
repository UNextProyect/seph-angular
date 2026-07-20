import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CatalogService } from '../../../../core/services/catalogs/catalog.service';
import { CreatePeriodRequest } from '../../../../shared/models/catalogs/requests/createPeriodRequest';
import { UpdatePeriodRequest } from '../../../../shared/models/catalogs/requests/updatePeriodRequest';
import { HttpErrorResponse } from '@angular/common/http';
/* Alta y edición de periodos.
Si la ruta contiene un :id, se carga el periodo correspondiente
y el formulario actualiza el registro en lugar de crear uno nuevo.

Se utilizan signals porque la aplicación trabaja de manera zoneless. */
@Component({
  selector: 'app-period-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './period-create.html',
  styleUrl: './period-create.scss'
})
export class PeriodCreateComponent implements OnInit {

  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /* Id del periodo que se está editando.
  Es null cuando se registra un periodo nuevo. */
  periodoId: number | null = null;

  isSaving = signal(false);
  isLoading = signal(false);

  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

  periodo: CreatePeriodRequest = {
    intAnio: new Date().getFullYear(),
    intNumeroPeriodo: 1,
    dateFechaInicio: '',
    dateFechaFin: ''
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.periodoId = Number(idParam);
      this.loadPeriodo(this.periodoId);
    }
  }

  /* Consulta los periodos y localiza el registro que será editado. */
  loadPeriodo(id: number): void {
    this.isLoading.set(true);

    this.catalogService.getPeriods().subscribe({
      next: (response) => {
        const registro = response.data?.find(
          periodo => periodo.id === id
        );

        if (!registro) {
          this.showNotification(
            'No se encontró el periodo solicitado.',
            'error'
          );

          this.isLoading.set(false);
          return;
        }

        this.periodo = {
          intAnio: registro.intAnio,
          intNumeroPeriodo: registro.intNumeroPeriodo,
          dateFechaInicio: registro.dateFechaInicio
            ? registro.dateFechaInicio.split('T')[0]
            : '',
          dateFechaFin: registro.dateFechaFin
            ? registro.dateFechaFin.split('T')[0]
            : ''
        };

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando periodo:', error);

        this.showNotification(
          'No fue posible cargar la información del periodo.',
          'error'
        );

        this.isLoading.set(false);
      }
    });
  }

/* Registra un periodo nuevo o actualiza el periodo seleccionado. */
savePeriodo(): void {
  if (this.isSaving()) {
    return;
  }

  if (!this.validateForm()) {
    return;
  }

  this.isSaving.set(true);

  const request: UpdatePeriodRequest = {
    intAnio: this.periodo.intAnio,
    intNumeroPeriodo: this.periodo.intNumeroPeriodo,
    dateFechaInicio: this.periodo.dateFechaInicio,
    dateFechaFin: this.periodo.dateFechaFin
  };

  if (this.periodoId) {
    this.updatePeriodo(this.periodoId, request);
    return;
  }

  this.createPeriodo(request);
}
/* Registra un nuevo periodo. */
private createPeriodo(request: CreatePeriodRequest): void {
  this.catalogService.createPeriod(request).subscribe({
    next: (response) => {
      if (
        response.statusCode < 200 ||
        response.statusCode >= 300
      ) {
        this.showNotification(
          response.message ?? 'No fue posible registrar el periodo.',
          'error'
        );

        this.isSaving.set(false);
        return;
      }

      this.showNotification(
        'Periodo registrado correctamente.',
        'success'
      );

      setTimeout(() => {
        this.isSaving.set(false);
        this.router.navigateByUrl('/admin/periodos');
      }, 1500);
    },
    error: (error: unknown) => {
      console.error('Error al guardar periodo:', error);

      this.showNotification(
        this.getErrorMessage(
          error,
          'No fue posible registrar el periodo.'
        ),
        'error'
      );

      this.isSaving.set(false);
    }
  });
}

/* Actualiza un periodo existente. */
private updatePeriodo(
  id: number,
  request: UpdatePeriodRequest
): void {
  this.catalogService.updatePeriod(id, request).subscribe({
    next: (response) => {
      if (
        response.statusCode < 200 ||
        response.statusCode >= 300
      ) {
        this.showNotification(
          response.message ?? 'No fue posible actualizar el periodo.',
          'error'
        );

        this.isSaving.set(false);
        return;
      }

      this.showNotification(
        'Periodo actualizado correctamente.',
        'success'
      );

      setTimeout(() => {
        this.isSaving.set(false);
        this.router.navigateByUrl('/admin/periodos');
      }, 1500);
    },
    error: (error: unknown) => {
      console.error('Error al actualizar periodo:', error);

      this.showNotification(
        this.getErrorMessage(
          error,
          'No fue posible actualizar el periodo.'
        ),
        'error'
      );

      this.isSaving.set(false);
    }
  });
}

  /* Valida en Angular las mismas reglas principales del backend. */
  private validateForm(): boolean {
    if (!this.periodo.intAnio || this.periodo.intAnio <= 0) {
      this.showNotification(
        'El año debe ser mayor que cero.',
        'error'
      );
      return false;
    }

    if (
      !this.periodo.intNumeroPeriodo ||
      this.periodo.intNumeroPeriodo <= 0
    ) {
      this.showNotification(
        'El número de periodo debe ser mayor que cero.',
        'error'
      );
      return false;
    }

    if (!this.periodo.dateFechaInicio) {
      this.showNotification(
        'La fecha de inicio es obligatoria.',
        'error'
      );
      return false;
    }

    if (!this.periodo.dateFechaFin) {
      this.showNotification(
        'La fecha de fin es obligatoria.',
        'error'
      );
      return false;
    }

    const fechaInicio = new Date(
      `${this.periodo.dateFechaInicio}T00:00:00`
    );

    const fechaFin = new Date(
      `${this.periodo.dateFechaFin}T00:00:00`
    );

    if (fechaFin < fechaInicio) {
      this.showNotification(
        'La fecha de fin no puede ser menor que la fecha de inicio.',
        'error'
      );
      return false;
    }

    if (fechaInicio.getFullYear() !== this.periodo.intAnio) {
      this.showNotification(
        'El año debe coincidir con el año de la fecha de inicio.',
        'error'
      );
      return false;
    }

    return true;
  }

  /* Obtiene el mensaje enviado por el backend cuando ocurre un error. */
private getErrorMessage(
  error: unknown,
  defaultMessage: string
): string {
  if (error instanceof HttpErrorResponse) {
    return error.error?.message ?? defaultMessage;
  }

  return defaultMessage;
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
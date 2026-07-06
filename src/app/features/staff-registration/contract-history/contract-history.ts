import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth/authService';
import { CatalogService } from '../../../core/services/catalogs/catalog.service';
import { InstitutionsService } from '../../../core/services/institutions/institutions-service';
import { StaffRegistrationService } from '../../../core/services/staff-registration/staff-registration.service';
import { CreateHistorialContratoRequest } from '../../../shared/models/staff-registration/requests/createHistorialContratoRequest';

@Component({
  selector: 'app-contract-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contract-history.html',
  styleUrl: './contract-history.scss'
})
export class ContractHistoryComponent implements OnInit {

  @Input() employeeId: number | null = null;

  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private staffRegistrationService = inject(StaffRegistrationService);
  private readonly institutionsService = inject(InstitutionsService);
  private router = inject(Router);

  /* La app es zoneless: los valores que se actualizan dentro de
  subscribe()/setTimeout() deben ser signals para que la vista
  se refresque sola (sin necesitar un clic adicional). */

  tiposPersonal = signal<any[]>([]);
  tiposContrato = signal<any[]>([]);
  areas = signal<any[]>([]);

  institutionName = signal('');

  maxDate = new Date().toISOString().split('T')[0];

  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

  isSaving = signal(false);

  contract: CreateHistorialContratoRequest = {
    id: 0,
    dateFechaIngreso: '',
    dateFechaInicio: '',
    idEmpleado: 0,
    idInstitucion: 0,
    idTipoPersonal: 0,
    idTipoContrato: 0,
    strOtroTipoContrato: null,
    idArea: 0,
    dateTimeFechaRegistro: new Date().toISOString(),
    bitActivo: true,
    dateTimeFechaBaja: null,
    idUsuarioRegistro: ''
  };

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadUserInstitution();
  }

  loadUserInstitution(): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser?.idInstitucion) {
      this.institutionName.set('Usuario sin institución asignada');
      return;
    }

    this.contract.idInstitucion = currentUser.idInstitucion;

    this.institutionsService.getInstitutions().subscribe({
      next: (response) => {
        const institution = (response.data ?? []).find(
          item => item.id === currentUser.idInstitucion
        );

        this.institutionName.set(
          institution?.strNombre ?? 'Institución asignada automáticamente'
        );
      },
      error: () => {
        this.institutionName.set('No fue posible cargar la institución');
      }
    });
  }

  loadCatalogs(): void {
    this.catalogService.getTiposPersonal().subscribe({
      next: (response: any) => {
        this.tiposPersonal.set(response.data ?? response.Data ?? response ?? []);
      }
    });

    this.catalogService.getTiposContrato().subscribe({
      next: (response: any) => {
        this.tiposContrato.set(response.data ?? response.Data ?? response ?? []);
      }
    });

    this.catalogService.getAreas().subscribe({
      next: (response: any) => {
        this.areas.set(response.data ?? response.Data ?? response ?? []);
      }
    });
  }

  saveContractHistory(): void {
    if (this.isSaving()) {
      return;
    }

    const isValid = this.validateForm();

    if (!isValid) {
      return;
    }

    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.showNotification(
        'No se encontró información del usuario autenticado.',
        'error'
      );
      return;
    }

    if (!currentUser.idInstitucion) {
      this.showNotification(
        'El usuario no tiene una institución asignada.',
        'error'
      );
      return;
    }

    this.isSaving.set(true);

    this.contract.idInstitucion = currentUser.idInstitucion;
    this.contract.idEmpleado = this.employeeId!;
    this.contract.idUsuarioRegistro = currentUser.id;
    this.contract.dateTimeFechaRegistro = new Date().toISOString();

    if (!this.contract.strOtroTipoContrato) {
      this.contract.strOtroTipoContrato = '';
    }

    this.staffRegistrationService
      .createHistorialContrato(this.contract)
      .subscribe({
        next: (response) => {
          if (response.statusCode !== 200) {
            this.showNotification(
              response.message ?? 'No fue posible guardar el historial de contrato.',
              'error'
            );

            this.isSaving.set(false);
            return;
          }

          this.showNotification(
            'El registro de personal ha concluido correctamente.',
            'success'
          );

          setTimeout(() => {
            this.isSaving.set(false);
            /* Al concluir el registro se regresa al concentrado
            para que el usuario vea su registro recién capturado. */
            this.router.navigateByUrl('/staff-registration');
          }, 2000);
        },
        error: (error) => {
          console.error('Error al guardar historial:', error);

          this.showNotification(
            'No fue posible guardar el historial de contrato.',
            'error'
          );

          this.isSaving.set(false);
        }
      });
  }

  private validateForm(): boolean {
    if (!this.employeeId) {
      this.showNotification(
        'No se encontró el empleado registrado.',
        'error'
      );
      return false;
    }

    if (!this.contract.dateFechaIngreso) {
      this.showNotification(
        'La fecha de ingreso a la institución es obligatoria.',
        'error'
      );
      return false;
    }

    if (!this.contract.dateFechaInicio) {
      this.showNotification(
        'La fecha de inicio del contrato vigente es obligatoria.',
        'error'
      );
      return false;
    }

    if (this.contract.dateFechaIngreso > this.maxDate) {
      this.showNotification(
        'La fecha de ingreso no puede ser futura.',
        'error'
      );
      return false;
    }

    if (this.contract.dateFechaInicio > this.maxDate) {
      this.showNotification(
        'La fecha de inicio del contrato no puede ser futura.',
        'error'
      );
      return false;
    }

    if (this.contract.dateFechaInicio < this.contract.dateFechaIngreso) {
      this.showNotification(
        'La fecha de inicio del contrato no puede ser menor a la fecha de ingreso.',
        'error'
      );
      return false;
    }

    if (!this.contract.idTipoPersonal) {
      this.showNotification(
        'El tipo de personal es obligatorio.',
        'error'
      );
      return false;
    }

    if (!this.contract.idTipoContrato) {
      this.showNotification(
        'El tipo de contratación es obligatorio.',
        'error'
      );
      return false;
    }

    if (!this.contract.idArea) {
      this.showNotification(
        'El área o departamento de adscripción es obligatorio.',
        'error'
      );
      return false;
    }

    if (
      this.contract.strOtroTipoContrato &&
      this.contract.strOtroTipoContrato.length > 100
    ) {
      this.showNotification(
        'El campo otro tipo de contratación no debe superar 100 caracteres.',
        'error'
      );
      return false;
    }

    return true;
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

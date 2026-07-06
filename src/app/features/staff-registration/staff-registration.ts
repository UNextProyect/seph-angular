import { Component, OnInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PersonalInformationComponent } from './personal-information/personal-information';
import { ContractHistoryComponent } from './contract-history/contract-history';
import { StaffRegistrationService } from '../../core/services/staff-registration/staff-registration.service';

@Component({
  selector: 'app-staff-registration',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PersonalInformationComponent,
    ContractHistoryComponent
  ],
  templateUrl: './staff-registration.html',
  styleUrl: './staff-registration.scss'
})
export class StaffRegistrationComponent implements OnInit {

  @ViewChild(PersonalInformationComponent)
  personalInformationComponent?: PersonalInformationComponent;

  @ViewChild(ContractHistoryComponent)
  contractHistoryComponent?: ContractHistoryComponent;

  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private staffRegistrationService = inject(StaffRegistrationService);

  menuCollapsed = false;
  currentStep = 1;
  personalInformationCompleted = false;
  employeeId: number | null = null;
  isSaving = false;

  /* true mientras se resuelve a qué paso/sub-pantalla mandar
  al usuario al retomar un registro (?empleado=ID). Ningún paso
  se muestra hasta resolverlo: si se dejara el valor por defecto
  de currentStep, Información Personal se crearía de inmediato
  con initialSubStep aún en 'basico' y, al no volver a destruirse,
  nunca tomaría en cuenta el valor correcto una vez resuelto. */
  resolvingResume = false;

  /* Sub-pantalla en la que debe iniciar Información Personal
  al mostrarse (solo aplica si currentStep === 1). */
  personalInfoInitialSubStep: 'basico' | 'academico' = 'basico';

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  /* Permite retomar un registro incompleto desde el concentrado
  (?empleado=ID). Consulta el empleado para saber en qué paso
  se quedó: si los datos académicos no están completos, se queda
  en el paso 1 (pantalla de perfil académico/SNI); si ya están
  completos, avanza al paso 2 (Historial de Contrato). */
  ngOnInit(): void {
    const empleadoParam = this.route.snapshot.queryParamMap.get('empleado');

    if (!empleadoParam) {
      return;
    }

    const id = Number(empleadoParam);
    this.employeeId = id;
    this.resolvingResume = true;

    this.staffRegistrationService.getEmpleadoById(id).subscribe({
      next: (response) => {
        const datosAcademicosCompletos = response.data?.bitDatosAcademicosCompletos ?? true;

        this.personalInformationCompleted = datosAcademicosCompletos;

        if (datosAcademicosCompletos) {
          this.currentStep = 2;
        } else {
          this.currentStep = 1;
          this.personalInfoInitialSubStep = 'academico';
        }

        this.resolvingResume = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error consultando el empleado a retomar:', error);

        // Ante un error, se conserva el comportamiento anterior
        // (avanzar directo a Historial de Contrato).
        this.personalInformationCompleted = true;
        this.currentStep = 2;
        this.resolvingResume = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleMenu(): void {
    this.menuCollapsed = !this.menuCollapsed;
  }

  nextStep(): void {
    if (this.isSaving) return;

    if (this.currentStep === 1) {
      if (!this.personalInformationComponent) return;

      this.isSaving = true;

      this.personalInformationComponent.saveEmployee(
        (employeeId) => {
  this.isSaving = false;
  this.employeeId = employeeId;
  this.personalInformationCompleted = true;

  this.showNotification(
    'Información personal guardada correctamente. Continuando al historial de contrato.',
    'success'
  );

  this.cdr.detectChanges();

  setTimeout(() => {
    this.currentStep = 2;
    this.cdr.detectChanges();
  }, 1500);
},
() => {
  this.isSaving = false;
}
      );
    }
  }

  previousStep(): void {
    if (this.currentStep === 2) {
      // Al regresar, Información Personal siempre inicia en la
      // pantalla básica (con los datos ya guardados poblados).
      this.personalInfoInitialSubStep = 'basico';
      this.currentStep = 1;
    }
  }

  goToStep(step: number): void {
    if (step === 1) {
      this.personalInfoInitialSubStep = 'basico';
      this.currentStep = 1;
      return;
    }

    if (step === 2 && this.personalInformationCompleted) {
      this.currentStep = 2;
    }
  }

  saveContractHistory(): void {
    if (!this.contractHistoryComponent) {
      return;
    }

    this.contractHistoryComponent.saveContractHistory();
  }

  showNotification(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.notificationMessage = message;
    this.notificationType = type;

    setTimeout(() => {
      this.notificationMessage = '';
    }, 4000);
  }
}
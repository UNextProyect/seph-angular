import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth/authService';
import { CatalogService } from '../../../core/services/catalogs/catalog.service';
import { StaffRegistrationService } from '../../../core/services/staff-registration/staff-registration.service';

import { CreateEmployeeRequest } from '../../../shared/models/staff-registration/requests/createEmployeeRequest';
import { UpdateDatosAcademicosRequest } from '../../../shared/models/staff-registration/requests/updateDatosAcademicosRequest';
import { UpdateEmpleadoBasicoRequest } from '../../../shared/models/staff-registration/requests/updateEmpleadoBasicoRequest';
import { SexResponse } from '../../../shared/models/catalogs/responses/sexResponse';
import { PerfilAcademicoResponse } from '../../../shared/models/catalogs/responses/perfilAcademicoResponse';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './personal-information.html',
  styleUrl: './personal-information.scss'
})
export class PersonalInformationComponent implements OnInit {

  /* Id del empleado a retomar (registro incompleto).
  Si viene definido, el formulario se puebla con sus datos
  guardados antes de mostrarse. */
  @Input() employeeId: number | null = null;

  /* Sub-pantalla en la que debe iniciar al retomar un registro:
  'basico' (Atrás desde Historial de Contrato) o 'academico'
  (Continuar cuando solo falta el perfil académico/SNI). */
  @Input() initialSubStep: 'basico' | 'academico' = 'basico';

  private staffRegistrationService = inject(StaffRegistrationService);
  private authService = inject(AuthService);
  private catalogService = inject(CatalogService);
  private cdr = inject(ChangeDetectorRef);

  /* La app es zoneless: los valores que se actualizan dentro de
  subscribe()/setTimeout() deben ser signals para que la vista
  se refresque sola (sin necesitar un clic adicional). */

  sexes = signal<SexResponse[]>([]);
  perfilesAcademicos = signal<PerfilAcademicoResponse[]>([]);

  /* "Información Personal" se captura en dos pantallas
  (según el diseño de Figma): primero los datos básicos,
  después el perfil académico y SNI/SNII. Ambas cuentan
  como el mismo paso del wizard (el stepper no avanza
  hasta terminar la segunda). */
  subStep = signal<'basico' | 'academico'>('basico');

  /* Id del empleado ya creado en la primera pantalla,
  necesario para guardar sus datos académicos. */
  employeeIdCreado: number | null = null;

  isSaving = signal(false);

  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

employee: CreateEmployeeRequest = {
  strNombre: '',
  strApellidoPat: '',
  strApellidoMat: '',
  strCurp: '',
  idSexo: 0,
  idInstitucion: 0,
  dateTimeFechaRegistro: new Date().toISOString(),
  idUsuarioRegistro: '',
  bitActivo: true,
  dateTimeFechaBaja: new Date().toISOString()
};

  /* ¿El empleado tiene perfil académico? */
  tienePerfilAcademico: 'SI' | 'NO' = 'NO';

  /* Perfil académico seleccionado en el dropdown,
  pendiente de agregar a la lista. */
  perfilAcademicoSeleccionado: number | null = null;

  /* Perfiles académicos ya agregados para este empleado.
  Puede ser uno o varios. */
  perfilesAgregados: PerfilAcademicoResponse[] = [];

  /* ¿El empleado pertenece al SNI/SNII?
  El radio solo habilita el campo; si es "No", strSNII
  se guarda como null. */
  tieneSNII: 'SI' | 'NO' = 'NO';

  /* Valor del SNI/SNII capturado (solo aplica si tieneSNII === 'SI'). */
  snii = '';

  ngOnInit(): void {
    this.loadSexes();

    if (this.employeeId) {
      /* Retomando un registro ya existente: el empleado fue
      creado en una sesión anterior, así que "Guardar" en la
      pantalla básica debe actualizar, no volver a crear. */
      this.employeeIdCreado = this.employeeId;
      this.subStep.set(this.initialSubStep);

      this.loadPerfilesAcademicos(() => this.loadEmployeeData(this.employeeId!));
    } else {
      this.loadPerfilesAcademicos();
    }
  }

  loadSexes(): void {
    this.catalogService
      .getSexes()
      .subscribe({
        next: (response) => {
          this.sexes.set(response.data ?? []);
        },
        error: (error) => {
          console.error('Error cargando sexos:', error);
        }
      });
  }

  loadPerfilesAcademicos(onLoaded?: () => void): void {
    this.catalogService
      .getPerfilesAcademicos()
      .subscribe({
        next: (response) => {
          this.perfilesAcademicos.set(response.data ?? []);
          onLoaded?.();
        },
        error: (error) => {
          console.error('Error cargando perfiles académicos:', error);
          onLoaded?.();
        }
      });
  }

  /* Puebla el formulario (básico + académico) con los datos ya
  guardados de un empleado, al retomar un registro incompleto. */
  private loadEmployeeData(employeeId: number): void {
    this.staffRegistrationService
      .getEmpleadoById(employeeId)
      .subscribe({
        next: (response) => {
          const data = response.data;

          if (!data) {
            return;
          }

          this.employee.strNombre = data.strNombre;
          this.employee.strApellidoPat = data.strApellidoPat;
          this.employee.strApellidoMat = data.strApellidoMat;
          this.employee.strCurp = data.strCurp;
          this.employee.idSexo = data.idSexo;

          this.tieneSNII = data.strSNII ? 'SI' : 'NO';
          this.snii = data.strSNII ?? '';

          this.perfilesAgregados = data.idsPerfilAcademico
            .map(id => this.perfilesAcademicos().find(perfil => perfil.id === id))
            .filter((perfil): perfil is PerfilAcademicoResponse => !!perfil);

          this.tienePerfilAcademico = this.perfilesAgregados.length > 0 ? 'SI' : 'NO';

          // Estas propiedades no son signals (van ligadas con ngModel);
          // al poblarse desde un subscribe() hay que forzar la detección
          // de cambios manualmente porque la app es zoneless.
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error cargando datos del empleado:', error);

          this.showNotification(
            'No fue posible cargar la información guardada del empleado.',
            'error'
          );
        }
      });
  }

  /* Agrega el perfil académico seleccionado en el dropdown
  a la lista de perfiles agregados (evita duplicados). */
  agregarPerfilAcademico(): void {
    if (!this.perfilAcademicoSeleccionado) {
      return;
    }

    const yaAgregado = this.perfilesAgregados.some(
      perfil => perfil.id === this.perfilAcademicoSeleccionado
    );

    if (yaAgregado) {
      this.perfilAcademicoSeleccionado = null;
      return;
    }

    const perfil = this.perfilesAcademicos().find(
      p => p.id === this.perfilAcademicoSeleccionado
    );

    if (perfil) {
      this.perfilesAgregados = [...this.perfilesAgregados, perfil];
    }

    this.perfilAcademicoSeleccionado = null;
  }

  /* Quita un perfil académico de la lista de agregados. */
  quitarPerfilAcademico(idPerfil: number): void {
    this.perfilesAgregados = this.perfilesAgregados.filter(
      perfil => perfil.id !== idPerfil
    );
  }

  /* Punto de entrada llamado por el wizard contenedor al dar clic
  en "Siguiente". Según la sub-pantalla actual, guarda los datos
  básicos (y muestra la pantalla de perfil académico) o guarda
  los datos académicos (y ahí sí avanza a Historial de Contrato). */
  saveEmployee(
    onSuccess: (employeeId: number) => void,
    onFinish?: () => void
  ): void {
    if (this.isSaving()) {
      return;
    }

    if (this.subStep() === 'basico') {
      this.saveBasicData(onSuccess, onFinish);
    } else {
      this.saveAcademicData(onSuccess, onFinish);
    }
  }

  private saveBasicData(
    onSuccess: (employeeId: number) => void,
    onFinish?: () => void
  ): void {
    if (!this.validateBasicForm()) {
      onFinish?.();
      return;
    }

    if (this.employeeIdCreado) {
      /* Retomando un registro ya existente: el empleado ya fue
      creado en una sesión anterior, así que se actualiza en
      lugar de crear uno nuevo. */
      this.updateExistingBasicData(onFinish);
      return;
    }

    this.isSaving.set(true);
    this.notificationMessage.set('');

    const finishSaving = (): void => {
      this.isSaving.set(false);
      onFinish?.();
    };

    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.showNotification(
        'No se encontró información del usuario autenticado.',
        'error'
      );

      finishSaving();
      return;
    }

    if (!currentUser.idInstitucion) {
      this.showNotification(
        'El usuario no tiene una institución asignada.',
        'error'
      );

      finishSaving();
      return;
    }

    this.employee.idInstitucion = currentUser.idInstitucion;
    this.employee.idUsuarioRegistro = currentUser.id;
    this.employee.dateTimeFechaRegistro = new Date().toISOString();

    this.staffRegistrationService
      .createEmployee(this.employee)
      .subscribe({
        next: (response) => {
          if (response.statusCode !== 200) {
            this.showNotification(
              response.message ??
                'No fue posible guardar la información personal.',
              'error'
            );

            finishSaving();
            return;
          }

          const employeeId =
            typeof response.data === 'number'
              ? response.data
              : response.data?.id;

          if (!employeeId) {
            this.showNotification(
              'No se recibió el identificador del empleado.',
              'error'
            );

            finishSaving();
            return;
          }

          this.employeeIdCreado = employeeId;
          this.subStep.set('academico');

          this.showNotification(
            'Información personal guardada. Continúa con el perfil académico.',
            'success'
          );

          finishSaving();
          // No se llama onSuccess aquí: el wizard permanece en este
          // mismo paso hasta que se guarden también los datos académicos.
        },
        error: (error) => {
          const errorMessage = this.getSaveEmployeeErrorMessage(error);

          this.showNotification(
            errorMessage,
            'error'
          );

          finishSaving();
        }
      });
  }

  private updateExistingBasicData(onFinish?: () => void): void {
    this.isSaving.set(true);
    this.notificationMessage.set('');

    const finishSaving = (): void => {
      this.isSaving.set(false);
      onFinish?.();
    };

    const request: UpdateEmpleadoBasicoRequest = {
      strNombre: this.employee.strNombre,
      strApellidoPat: this.employee.strApellidoPat,
      strApellidoMat: this.employee.strApellidoMat,
      strCurp: this.employee.strCurp,
      idSexo: this.employee.idSexo
    };

    this.staffRegistrationService
      .updateEmpleadoBasico(this.employeeIdCreado!, request)
      .subscribe({
        next: (response) => {
          if (response.statusCode !== 200) {
            this.showNotification(
              response.message ??
                'No fue posible actualizar la información personal.',
              'error'
            );

            finishSaving();
            return;
          }

          this.subStep.set('academico');

          this.showNotification(
            'Información personal actualizada. Continúa con el perfil académico.',
            'success'
          );

          finishSaving();
          // No se llama onSuccess aquí: el wizard permanece en este
          // mismo paso hasta que se guarden también los datos académicos.
        },
        error: () => {
          this.showNotification(
            'No fue posible actualizar la información personal.',
            'error'
          );

          finishSaving();
        }
      });
  }

  private saveAcademicData(
    onSuccess: (employeeId: number) => void,
    onFinish?: () => void
  ): void {
    if (!this.employeeIdCreado) {
      this.showNotification(
        'No se encontró el empleado registrado.',
        'error'
      );
      onFinish?.();
      return;
    }

    if (this.tienePerfilAcademico === 'SI' && this.perfilesAgregados.length === 0) {
      this.showNotification(
        'Agrega al menos un perfil académico o selecciona "No".',
        'error'
      );
      onFinish?.();
      return;
    }

    if (this.tieneSNII === 'SI' && !this.snii.trim()) {
      this.showNotification(
        'Captura el SNI/SNII o selecciona "No".',
        'error'
      );
      onFinish?.();
      return;
    }

    if (this.tieneSNII === 'SI' && this.snii.trim().length > 12) {
      this.showNotification(
        'El SNI/SNII no debe superar 12 caracteres.',
        'error'
      );
      onFinish?.();
      return;
    }

    this.isSaving.set(true);
    this.notificationMessage.set('');

    const request: UpdateDatosAcademicosRequest = {
      strSNII: this.tieneSNII === 'SI' ? this.snii.trim() : null,
      idsPerfilAcademico: this.tienePerfilAcademico === 'SI'
        ? this.perfilesAgregados.map(perfil => perfil.id)
        : []
    };

    this.staffRegistrationService
      .updateDatosAcademicos(this.employeeIdCreado, request)
      .subscribe({
        next: (response) => {
          this.isSaving.set(false);
          onFinish?.();

          if (response.statusCode !== 200) {
            this.showNotification(
              response.message ?? 'No fue posible guardar los datos académicos.',
              'error'
            );
            return;
          }

          onSuccess(this.employeeIdCreado!);
        },
        error: () => {
          this.isSaving.set(false);
          onFinish?.();

          this.showNotification(
            'No fue posible guardar los datos académicos.',
            'error'
          );
        }
      });
  }

  /* Valida los datos básicos antes de guardar, reflejando las mismas
  reglas que ya exige el backend (EmpleadosCommandValidator): nombre,
  apellidos y CURP obligatorios con su longitud máxima, y sexo
  seleccionado. Evita un viaje de red solo para que el backend
  rechace el formulario. */
  private validateBasicForm(): boolean {
    if (!this.employee.strNombre.trim()) {
      this.showNotification('El nombre es obligatorio.', 'error');
      return false;
    }

    if (this.employee.strNombre.length > 250) {
      this.showNotification('El nombre no debe superar 250 caracteres.', 'error');
      return false;
    }

    if (!this.employee.strApellidoPat.trim()) {
      this.showNotification('El apellido paterno es obligatorio.', 'error');
      return false;
    }

    if (this.employee.strApellidoPat.length > 250) {
      this.showNotification('El apellido paterno no debe superar 250 caracteres.', 'error');
      return false;
    }

    if (!this.employee.strApellidoMat.trim()) {
      this.showNotification('El apellido materno es obligatorio.', 'error');
      return false;
    }

    if (this.employee.strApellidoMat.length > 250) {
      this.showNotification('El apellido materno no debe superar 250 caracteres.', 'error');
      return false;
    }

    if (!this.employee.strCurp.trim()) {
      this.showNotification('La CURP es obligatoria.', 'error');
      return false;
    }

    if (this.employee.strCurp.length > 18) {
      this.showNotification('La CURP no debe superar 18 caracteres.', 'error');
      return false;
    }

    if (!this.employee.idSexo) {
      this.showNotification('El sexo es obligatorio.', 'error');
      return false;
    }

    return true;
  }

  private getSaveEmployeeErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }

    if (error.status === 409) {
      return 'La CURP ya se encuentra registrada.';
    }

    if (error.status === 0) {
      return 'No fue posible conectar con el servidor.';
    }

    if (error.status === 500) {
      return 'Ocurrió un error inesperado al guardar la información.';
    }

    return 'No fue posible guardar la información personal.';
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

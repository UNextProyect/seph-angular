import {
    ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService }
  from '../../../core/services/auth/authService';

import { InstitutionalInformationService }
  from '../../../core/services/institutional-information/institutional-information.service';

  import { CreateReportePersonalRequest }
from '../../../shared/models/institutional-information/personal/requests/createReportePersonalRequest';

import { UpdateReportePersonalRequest }
from '../../../shared/models/institutional-information/personal/requests/updateReportePersonalRequest';

import { ApiResponse }
  from '../../../shared/models/apiResponse';

import { ReportePersonalResponse }
  from '../../../shared/models/institutional-information/personal/responses/reportePersonalResponse';
  import { finalize } from 'rxjs';

  import { CatalogService }
  from '../../../core/services/catalogs/catalog.service';

import { NivelAcademicoResponse }
  from '../../../shared/models/catalogs/responses/nivelAcademicoResponse';

  import { BarChartComponent }
  from '../../../shared/ui/charts/bar-chart/bar-chart';

  
  
  
  

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BarChartComponent
  ],
  templateUrl: './personal-data.html',
  styleUrl: './personal-data.scss'
})
export class PersonalDataComponent implements OnInit {

  // Servicios utilizados por el componente.
private institutionalInformationService =
  inject(InstitutionalInformationService);

private authService =
  inject(AuthService);

private catalogService =
  inject(CatalogService);

private cdr =
  inject(ChangeDetectorRef);
  // Relación institución-periodo utilizada
  // para consultar y guardar el reporte.
  idMapInstitucionPeriodo: number | null = null;

  // Información del periodo.
  periodo = '';

  fechaRegistro = '';
  // Vista activa: captura o previsualización.
activeView: 'capture' | 'preview' = 'capture';

/*
 * Catálogo de niveles académicos
 * disponible para el formulario.
 */
nivelesAcademicos:
NivelAcademicoResponse[] = [];

// Página interna del formulario.
currentPage = 1;

  /*
 * Información capturada del reporte
 * de personal.
 */
personalReport = {

  totalGeneral: null as number | null,

  totalDirectivos: null as number | null,
  directivosHombres: null as number | null,
  directivosMujeres: null as number | null,

  totalAdministrativos: null as number | null,
  administrativosHombres: null as number | null,
  administrativosMujeres: null as number | null,

  totalDocentes: null as number | null,
  docentesHombres: null as number | null,
  docentesMujeres: null as number | null,

  docentesTiempoCompleto: null as number | null,
  docentesAsignatura: null as number | null,
  docentesHora: null as number | null,

  idNivelAcademico: null as number | null

};

/*
 * Respaldo de la información para
 * restaurarla al cancelar una edición.
 */
private originalValues:
typeof this.personalReport | null = null;

// Indica si ya existe un reporte guardado.
reportSaved = false;

// Indica si el usuario está editando.
isEditing = false;

// Evita múltiples clics.
isSaving = false;

// Indica si el componente está cargando información.
isLoading = false;

  // Mensajes del formulario.
  saveMessage = '';

  saveMessageType: 'success' | 'error' =
    'success';

  ngOnInit(): void {

  this.loadActivePeriod();

  this.loadNivelesAcademicos();

}

/*
 * Informa al componente contenedor
 * si el reporte de personal ya está guardado.
 */
@Output()
personalCompletedChange =
  new EventEmitter<boolean>();

      /*
    * Muestra la vista de captura
    * del reporte de personal.
    */
    showCapture(): void {
      this.activeView = 'capture';
    }

    /*
    * Muestra la vista previa
    * del reporte de personal.
    */
    showPreview(): void {
      this.activeView = 'preview';
    }

    /*
    * Avanza a la segunda página
    * del formulario.
    */
    nextPage(): void {
      if (this.currentPage === 1) {
        this.currentPage = 2;
      }
    }

    /*
    * Regresa a la primera página
    * del formulario.
    */
    previousPage(): void {
      if (this.currentPage === 2) {
        this.currentPage = 1;
      }
    }

  /*
   * Obtiene el periodo activo
   * de la institución del usuario.
   */
  private loadActivePeriod(): void {

    const idInstitucion =
      this.authService.currentUser()?.idInstitucion;

    if (!idInstitucion) {

      this.showError(
        'El usuario no tiene una institución asignada.'
      );

      return;
    }

    this.institutionalInformationService
      .getPeriodoActivo(idInstitucion)
      .subscribe({

        next: (response) => {

          const periodoActivo =
            response.data;

          if (!periodoActivo) {

            this.showError(
              'No existe un periodo activo para la institución.'
            );

            return;
          }

          this.idMapInstitucionPeriodo =
            periodoActivo.idMapInstitucionPeriodo;

          this.periodo =
            periodoActivo.strPeriodo;

          this.loadReportePersonal();
        },

        error: (error: HttpErrorResponse) => {

          console.error(error);

          this.showError(
            'No fue posible obtener el periodo activo.'
          );

        }

      });

  }

  /*
 * Obtiene el catálogo de niveles
 * académicos disponibles.
 */
private loadNivelesAcademicos(): void {

  this.catalogService
    .getNivelesAcademicos()
    .subscribe({

      next: (response) => {

        this.nivelesAcademicos =
          response.data ?? [];

      },

      error: (error) => {

        console.error(error);

        this.showError(
          'No fue posible cargar el catálogo de niveles académicos.'
        );

      }

    });

}

  /*
   * Consulta si ya existe un reporte
   * registrado para el periodo activo.
   */
  private loadReportePersonal(): void {

    if (!this.idMapInstitucionPeriodo) {
      return;
    }

    this.institutionalInformationService
      .getReportePersonal(
        this.idMapInstitucionPeriodo
      )
      .subscribe({

           next: (response) => {

            const reporte = response.data;

            if (!reporte) {
              return;
            }

            // Confirma que ya existe un reporte guardado.
            this.reportSaved = true;
            this.personalCompletedChange.emit(true);

            // Llena el formulario con la información registrada.
            this.personalReport = {
              totalGeneral:
                reporte.intTotalGeneral,

              totalDirectivos:
                reporte.intTotalDirectivos,

              directivosHombres:
                reporte.intTotalDirectivosHombres,

              directivosMujeres:
                reporte.intTotalDirectivosMujeres,

              totalAdministrativos:
                reporte.intTotalAdministrativos,

              administrativosHombres:
                reporte.intTotalAdministrativosHombres,

              administrativosMujeres:
                reporte.intTotalAdministrativosMujeres,

              totalDocentes:
                reporte.intTotalDocentes,

              docentesHombres:
                reporte.intTotalDocentesHombres,

              docentesMujeres:
                reporte.intTotalDocentesMujeres,

              docentesTiempoCompleto:
                reporte.intTotalDocentesTiempoCompleto,

              docentesAsignatura:
                reporte.intTotalDocentesAsignatura,

              docentesHora:
                reporte.intTotalDocentesHora,

              idNivelAcademico:
                reporte.idNivelAcademico
            };

            this.fechaRegistro =
              new Date(
                reporte.dateTimeFechaRegistro
              ).toLocaleDateString('es-MX');

            this.cdr.detectChanges();
          },


        error: (error: HttpErrorResponse) => {

          if (error.status === 404) {
            return;
          }

          console.error(error);

          this.showError(
            'No fue posible consultar el reporte de personal.'
          );

        }

      });

  }

  
/*
 * Valida que los campos obligatorios
 * del formulario tengan información.
 */
private validateRequiredFields(): boolean {

  if (this.personalReport.totalGeneral === null) {
    return this.validationError(
      'Captura el total general del personal.'
    );
  }

  if (this.personalReport.totalDirectivos === null) {
    return this.validationError(
      'Captura el total de directivos.'
    );
  }

  if (this.personalReport.totalAdministrativos === null) {
    return this.validationError(
      'Captura el total de administrativos.'
    );
  }

  if (this.personalReport.totalDocentes === null) {
    return this.validationError(
      'Captura el total de docentes.'
    );
  }

  if (this.personalReport.idNivelAcademico === null) {
    return this.validationError(
      'Selecciona el nivel académico predominante.'
    );
  }

  return true;

}

  /*
 * Valida que los valores numéricos
 * no contengan cantidades negativas.
 */
private validateNegativeValues(): boolean {

  const numericFields = [
    this.personalReport.totalGeneral,

    this.personalReport.totalDirectivos,
    this.personalReport.directivosHombres,
    this.personalReport.directivosMujeres,

    this.personalReport.totalAdministrativos,
    this.personalReport.administrativosHombres,
    this.personalReport.administrativosMujeres,

    this.personalReport.totalDocentes,
    this.personalReport.docentesHombres,
    this.personalReport.docentesMujeres,

    this.personalReport.docentesTiempoCompleto,
    this.personalReport.docentesAsignatura,
    this.personalReport.docentesHora
  ];

  const hasNegativeValue =
    numericFields.some(value =>
      value !== null && value < 0
    );

  if (hasNegativeValue) {
    return this.validationError(
      'Los valores del personal no pueden ser negativos.'
    );
  }

  return true;

}

/*
 * Valida que la suma de hombres
 * y mujeres directivos sea correcta.
 */
private validateDirectivos(): boolean {

  if (
    this.personalReport.directivosHombres === null ||
    this.personalReport.directivosMujeres === null
  ) {

    return this.validationError(
      'Captura el total de hombres y mujeres directivos.'
    );

  }

  if (
    this.personalReport.directivosHombres +
    this.personalReport.directivosMujeres !==
    this.personalReport.totalDirectivos
  ) {

    return this.validationError(
      'Verifica los campos Directivos Hombres y Directivos Mujeres. Su suma debe coincidir con el Total de Directivos.'
    );

  }

  return true;

}


/*
 * Valida que la suma de hombres
 * y mujeres administrativos sea correcta.
 */
private validateAdministrativos(): boolean {

  if (
    this.personalReport.administrativosHombres === null ||
    this.personalReport.administrativosMujeres === null
  ) {

    return this.validationError(
      'Captura el total de hombres y mujeres administrativos.'
    );

  }

  if (
    this.personalReport.administrativosHombres +
    this.personalReport.administrativosMujeres !==
    this.personalReport.totalAdministrativos
  ) {

    return this.validationError(
      'Verifica los campos Administrativos Hombres y Administrativos Mujeres. Su suma debe coincidir con el Total de Administrativos.'
    );

  }

  return true;

}


/*
 * Valida la distribución del
 * personal docente.
 */
private validateDocentes(): boolean {

  if (
    this.personalReport.docentesHombres === null ||
    this.personalReport.docentesMujeres === null
  ) {

    return this.validationError(
      'Captura el total de hombres y mujeres docentes.'
    );

  }

  if (
    this.personalReport.docentesHombres +
    this.personalReport.docentesMujeres !==
    this.personalReport.totalDocentes
  ) {

    return this.validationError(
      'Verifica los campos Docentes Hombres y Docentes Mujeres. Su suma debe coincidir con el Total de Docentes.'
    );

  }

  if (
    this.personalReport.docentesTiempoCompleto === null ||
    this.personalReport.docentesAsignatura === null ||
    this.personalReport.docentesHora === null
  ) {

    return this.validationError(
      'Completa la distribución de docentes por tipo de contratación.'
    );

  }

  if (
    this.personalReport.docentesTiempoCompleto +
    this.personalReport.docentesAsignatura +
    this.personalReport.docentesHora !==
    this.personalReport.totalDocentes
  ) {

    return this.validationError(
      'La suma de docentes de tiempo completo, asignatura y por hora debe coincidir con el Total de Docentes.'
    );

  }

  return true;

}

/*
 * Valida que la suma de directivos,
 * administrativos y docentes coincida
 * con el total general del personal.
 */
private validateTotalGeneral(): boolean {

  if (
    this.personalReport.totalDirectivos! +
    this.personalReport.totalAdministrativos! +
    this.personalReport.totalDocentes! !==
    this.personalReport.totalGeneral
  ) {

    return this.validationError(
      'La suma de Directivos, Administrativos y Docentes debe coincidir con el Total General.'
    );

  }

  return true;

}


/*
 * Ejecuta todas las validaciones
 * del formulario de personal.
 */
private validatePersonalData(): boolean {

  if (!this.validateRequiredFields()) {
    return false;
  }

  if (!this.validateNegativeValues()) {
    return false;
  }

  if (!this.validateDirectivos()) {
    return false;
  }

  if (!this.validateAdministrativos()) {
    return false;
  }

  if (!this.validateDocentes()) {
    return false;
  }

  if (!this.validateTotalGeneral()) {
    return false;
  }

  return true;

}


/*
 * Construye la petición utilizada
 * para registrar un nuevo reporte.
 */
private buildCreateRequest(
  userId: string
): CreateReportePersonalRequest {

  return {

    idMapInstitucionPeriodo:
      this.idMapInstitucionPeriodo!,

    intTotalGeneral:
      this.personalReport.totalGeneral!,

    intTotalDirectivos:
      this.personalReport.totalDirectivos!,

    intTotalDirectivosHombres:
      this.personalReport.directivosHombres!,

    intTotalDirectivosMujeres:
      this.personalReport.directivosMujeres!,

    intTotalAdministrativos:
      this.personalReport.totalAdministrativos!,

    intTotalAdministrativosHombres:
      this.personalReport.administrativosHombres!,

    intTotalAdministrativosMujeres:
      this.personalReport.administrativosMujeres!,

    intTotalDocentes:
      this.personalReport.totalDocentes!,

    intTotalDocentesHombres:
      this.personalReport.docentesHombres!,

    intTotalDocentesMujeres:
      this.personalReport.docentesMujeres!,

    intTotalDocentesTiempoCompleto:
      this.personalReport.docentesTiempoCompleto!,

    intTotalDocentesAsignatura:
      this.personalReport.docentesAsignatura!,

    intTotalDocentesHora:
      this.personalReport.docentesHora!,

    idNivelAcademico:
      this.personalReport.idNivelAcademico!,

    idUsuarioRegistro:
      userId

  };

}

/*
 * Construye la petición utilizada
 * para actualizar un reporte existente.
 */
private buildUpdateRequest():
UpdateReportePersonalRequest {

  return {

    idMapInstitucionPeriodo:
      this.idMapInstitucionPeriodo!,

    intTotalGeneral:
      this.personalReport.totalGeneral!,

    intTotalDirectivos:
      this.personalReport.totalDirectivos!,

    intTotalDirectivosHombres:
      this.personalReport.directivosHombres!,

    intTotalDirectivosMujeres:
      this.personalReport.directivosMujeres!,

    intTotalAdministrativos:
      this.personalReport.totalAdministrativos!,

    intTotalAdministrativosHombres:
      this.personalReport.administrativosHombres!,

    intTotalAdministrativosMujeres:
      this.personalReport.administrativosMujeres!,

    intTotalDocentes:
      this.personalReport.totalDocentes!,

    intTotalDocentesHombres:
      this.personalReport.docentesHombres!,

    intTotalDocentesMujeres:
      this.personalReport.docentesMujeres!,

    intTotalDocentesTiempoCompleto:
      this.personalReport.docentesTiempoCompleto!,

    intTotalDocentesAsignatura:
      this.personalReport.docentesAsignatura!,

    intTotalDocentesHora:
      this.personalReport.docentesHora!,

    idNivelAcademico:
      this.personalReport.idNivelAcademico!

  };

}

/*
 * Valida la información capturada
 * y decide si registra o actualiza
 * el reporte de personal.
 */
savePersonalData(
  onSuccess?: () => void
): void {

  console.log('4. Entró a savePersonalData');

  if (this.isSaving) {

    console.log(
      '5. El componente hijo ya está guardando'
    );

    return;
  }

  if (!this.idMapInstitucionPeriodo) {

    console.log(
      '6. No existe idMapInstitucionPeriodo'
    );

    this.showError(
      'No existe un periodo activo para la institución.'
    );

    return;
  }

  const user =
    this.authService.currentUser();

  if (!user?.id) {

    console.log(
      '7. No se encontró el usuario'
    );

    this.showError(
      'No fue posible identificar al usuario.'
    );

    return;
  }

  console.log(
    '8. Antes de validar',
    this.personalReport
  );

  if (!this.validatePersonalData()) {

    console.log(
      '9. La validación detuvo el guardado'
    );

    return;
  }

  console.log(
    '10. Las validaciones fueron correctas'
  );

  if (
    this.reportSaved &&
    this.isEditing
  ) {

    this.updatePersonalData(
  this.buildUpdateRequest(),
  onSuccess
);

    return;
  }

  if (!this.reportSaved) {

    this.createPersonalData(
  this.buildCreateRequest(user.id),
  onSuccess
);

  }

}

/*
 * Registra un nuevo reporte
 * de personal.
 */
private createPersonalData(
  request: CreateReportePersonalRequest,
  onSuccess?: () => void
): void {

  this.isSaving = true;
  this.saveMessage = '';

  this.institutionalInformationService
    .createReportePersonal(request)
    .pipe(
      finalize(() => {

        this.isSaving = false;

        this.cdr.detectChanges();

      })
    )
    .subscribe({

     next: (
  response: ApiResponse<ReportePersonalResponse>
) => {

        if (!response.data) {

          this.showError(
            'No fue posible guardar el reporte de personal.'
          );

          return;
        }

        this.reportSaved = true;
this.personalCompletedChange.emit(true);
onSuccess?.();
        

        this.fechaRegistro =
          new Date(
            response.data.dateTimeFechaRegistro
          ).toLocaleDateString('es-MX');

        this.showSaveMessage(
          'Reporte de personal guardado correctamente.',
          'success'
        );

        // Recarga la información oficial.
        this.loadReportePersonal();

      },

      error: (error: HttpErrorResponse) => {

        console.error(error);

        const message =
          error.error?.message ??
          'No fue posible guardar el reporte de personal.';

        this.showSaveMessage(
          message,
          'error'
        );

      }

    });

}

/*
 * Habilita los campos para modificar
 * un reporte previamente guardado.
 */
enableEdit(): void {

  if (!this.reportSaved) {
    return;
  }

  /*
   * Guarda una copia independiente
   * de la información actual.
   */
  this.originalValues = {
    ...this.personalReport
  };

  this.isEditing = true;

}

/*
 * Cancela la edición y restaura
 * la información obtenida del backend.
 */
cancelEdit(): void {

  if (this.originalValues) {

    this.personalReport = {
      ...this.originalValues
    };

  }

  this.isEditing = false;
  this.originalValues = null;

  this.showSaveMessage(
    'Los cambios fueron cancelados.',
    'success'
  );

  this.cdr.detectChanges();

}

/*
 * Actualiza un reporte
  * de personal existente.
   */
   private updatePersonalData(
     request: UpdateReportePersonalRequest,
       onSuccess?: () => void
       ): void {

         this.isSaving = true;
           this.saveMessage = '';

             this.institutionalInformationService
                 .updateReportePersonal(request)
                     .pipe(
                           finalize(() => {

                                   this.isSaving = false;

                                           this.cdr.detectChanges();

                                                 })
                                                     )
    .subscribe({

      next: (response) => {

        if (!response.data) {

          this.showSaveMessage(
            'No fue posible actualizar el reporte de personal.',
            'error'
          );

          return;
        }

        this.reportSaved = true;
        this.personalCompletedChange.emit(true);
        onSuccess?.();
        this.isEditing = false;
        this.originalValues = null;

        this.showSaveMessage(
          'Reporte de personal actualizado correctamente.',
          'success'
        );

        // Recarga la información oficial.
        this.loadReportePersonal();

      },

      error: (error: HttpErrorResponse) => {

        console.error(error);

        const message =
          error.error?.message ??
          'No fue posible actualizar el reporte de personal.';

        this.showSaveMessage(
          message,
          'error'
        );

      }

    });

}


/*
 * Muestra un mensaje de validación
 * y detiene el proceso actual.
 */
private validationError(
  message: string
): boolean {

  this.showError(message);

  return false;

}

  /*
   * Muestra mensajes de error.
   */
 private showError(
  message: string
): void {

  console.log(
    'Mensaje mostrado:',
    message
  );

  this.saveMessage =
    message;

  this.saveMessageType =
    'error';
    this.cdr.detectChanges();

  setTimeout(() => {

  this.saveMessage = '';

  this.cdr.detectChanges();

}, 4000);

}

  /*
 * Muestra mensajes de éxito o error
 * dentro del formulario de personal.
 */
private showSaveMessage(
  message: string,
  type: 'success' | 'error'
): void {

  this.saveMessage = message;
  this.saveMessageType = type;

  setTimeout(() => {
    this.saveMessage = '';
  }, 4000);

}

  

}
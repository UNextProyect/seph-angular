import {ChangeDetectorRef,Component, OnInit,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BarChartComponent }
  from '../../../shared/ui/charts/bar-chart/bar-chart';
import { StatCardComponent }
  from '../../../shared/ui/charts/stat-card/stat-card';
import { AuthService }
  from '../../../core/services/auth/authService';
import { InstitutionalInformationService }
  from '../../../core/services/institutional-information/institutional-information.service';
import { CreateReporteMatriculaRequest }
  from '../../../shared/models/institutional-information/enrollment/requests/createReporteMatriculaRequest';
import { finalize } from 'rxjs';
import { UpdateReporteMatriculaRequest }
  from '../../../shared/models/institutional-information/enrollment/requests/updateReporteMatriculaRequest';

  @Component({
  selector: 'app-enrollment-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BarChartComponent,
    StatCardComponent
  ],
  templateUrl: './enrollment-data.html',
  styleUrl: './enrollment-data.scss'
})
export class EnrollmentDataComponent implements OnInit {

  // Servicio que consulta la información institucional del backend.
  private institutionalInformationService =
    inject(InstitutionalInformationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // Indica si el formulario ya tiene un reporte guardado.
reportSaved = false;
// Indica si el usuario está modificando un reporte existente.
isEditing = false;

// Conserva una copia para restaurar los datos si se cancela la edición.
private originalValues: {
  matriculaTotal: number | null;
  matriculaHombres: number | null;
  matriculaMujeres: number | null;
  matriculaTsu: number | null;
  matriculaLicenciatura: number | null;
  matriculaPostgrado: number | null;
  tasaDesercion: number | null;
  tasaReprobacion: number | null;
  tasaEficienciaTerminal: number | null;
} | null = null;

// Evita múltiples clics mientras se guarda.
isSaving = false;

// Mensaje interno del formulario.
saveMessage = '';
saveMessageType: 'success' | 'error' = 'success'; 
  
  // Se obtiene automáticamente desde el periodo activo de la institución.
  idMapInstitucionPeriodo: number | null = null;

  // Vista activa: captura o previsualización.
  activeView: 'capture' | 'preview' = 'capture';

  // Página interna del formulario.
  currentPage = 1;

  // Datos capturados en la primera página.
  matriculaTotal: number | null = null;
  matriculaHombres: number | null = null;
  matriculaMujeres: number | null = null;
  matriculaTsu: number | null = null;
  matriculaLicenciatura: number | null = null;
  matriculaPostgrado: number | null = null;

  // Datos capturados en la segunda página.
  tasaDesercion: number | null = null;
  tasaReprobacion: number | null = null;
  tasaEficienciaTerminal: number | null = null;

  // Datos informativos del periodo.
  periodo = '';
  fechaRegistro = '';

  // Datos del comparativo obtenidos desde el backend.
  previousPeriod: string | null = null;
  currentPeriod = '';
  difference = 0;
  percentage = 0;
  comparisonStatus = 'Sin periodo anterior';

  // Estados de carga y error del comparativo.
  isLoadingComparison = false;
  comparisonError = '';

  /*
   * Al iniciar el componente consulta
   * el comparativo del periodo actual.
   */
  ngOnInit(): void {
    this.loadActivePeriod();
  }

  // Muestra la vista de captura.
  showCapture(): void {
    this.activeView = 'capture';
  }

  // Muestra la vista previa y las gráficas.
  showPreview(): void {
    this.activeView = 'preview';
  }

  // Avanza a la segunda página del formulario.
  nextPage(): void {
    if (this.currentPage === 1) {
      this.currentPage = 2;
    }
  }

  // Regresa a la primera página del formulario.
  previousPage(): void {
    if (this.currentPage === 2) {
      this.currentPage = 1;
    }
  }
  /*
 * Habilita los campos para modificar
 * un reporte previamente guardado.
 */
enableEdit(): void {
  if (!this.reportSaved) {
    return;
  }

  // Guarda una copia de los valores actuales.
  this.originalValues = {
    matriculaTotal: this.matriculaTotal,
    matriculaHombres: this.matriculaHombres,
    matriculaMujeres: this.matriculaMujeres,
    matriculaTsu: this.matriculaTsu,
    matriculaLicenciatura: this.matriculaLicenciatura,
    matriculaPostgrado: this.matriculaPostgrado,
    tasaDesercion: this.tasaDesercion,
    tasaReprobacion: this.tasaReprobacion,
    tasaEficienciaTerminal: this.tasaEficienciaTerminal
  };

  this.isEditing = true;
}

/*
 * Cancela la edición y restaura
 * la información obtenida de la base de datos.
 */
cancelEdit(): void {
  if (this.originalValues) {
    this.matriculaTotal =
      this.originalValues.matriculaTotal;

    this.matriculaHombres =
      this.originalValues.matriculaHombres;

    this.matriculaMujeres =
      this.originalValues.matriculaMujeres;

    this.matriculaTsu =
      this.originalValues.matriculaTsu;

    this.matriculaLicenciatura =
      this.originalValues.matriculaLicenciatura;

    this.matriculaPostgrado =
      this.originalValues.matriculaPostgrado;

    this.tasaDesercion =
      this.originalValues.tasaDesercion;

    this.tasaReprobacion =
      this.originalValues.tasaReprobacion;

    this.tasaEficienciaTerminal =
      this.originalValues.tasaEficienciaTerminal;
  }

  this.isEditing = false;
  this.originalValues = null;
}
/*
 * Obtiene el periodo activo de la institución
 * asociada al usuario autenticado.
 */
loadActivePeriod(): void {
  const idInstitucion =
    this.authService.currentUser()?.idInstitucion;

  if (!idInstitucion) {
    this.comparisonError =
      'El usuario no tiene una institución asignada.';
    return;
  }

  this.isLoadingComparison = true;
  this.comparisonError = '';

  this.institutionalInformationService
    .getPeriodoActivo(idInstitucion)
    .subscribe({
      next: (response) => {
        const activePeriod = response.data;

        if (!activePeriod) {
          this.comparisonError =
            'No existe un periodo activo para la institución.';
          this.isLoadingComparison = false;
          return;
        }

        this.idMapInstitucionPeriodo =
          activePeriod.idMapInstitucionPeriodo;

        this.periodo =
          activePeriod.strPeriodo;

        this.loadReporteMatricula();

        this.loadComparison();
      },
      error: (error: HttpErrorResponse) => {
        console.error(
          'Error consultando el periodo activo:',
          error
        );

        this.comparisonError =
          'No se pudo obtener el periodo activo.';

        this.isLoadingComparison = false;
      }
    });
}
/*
 * Obtiene el reporte guardado del periodo activo
 * y llena automáticamente el formulario.
 */
loadReporteMatricula(): void {
  if (!this.idMapInstitucionPeriodo) {
    return;
  }


  this.institutionalInformationService
    .getReporteMatricula(
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

        this.matriculaTotal =
          reporte.intTotal;

        this.matriculaHombres =
          reporte.intTotalHombres;

        this.matriculaMujeres =
          reporte.intTotalMujeres;

        this.matriculaTsu =
          reporte.intTsu;

        this.matriculaLicenciatura =
          reporte.intLicenciatura;

        this.matriculaPostgrado =
          reporte.intPostgrado;

        this.tasaDesercion =
          reporte.decimalTazaDesercion;

        this.tasaReprobacion =
          reporte.decimalTazaReprobacion;

        this.tasaEficienciaTerminal =
          reporte.decimalTazaEficienciaTerminal;

        this.fechaRegistro =
          new Date(
            reporte.dateTimeFechaRegistro
          ).toLocaleDateString('es-MX');

      // Refresca inmediatamente inputs, fecha y gráficas.
      this.cdr.detectChanges();
        },
      error: (error) => {
        /*
         * Si no existe reporte todavía, el formulario
         * permanece vacío para permitir la captura.
         */
        if (error.status === 404) {
          return;
        }

        console.error(
          'Error consultando el reporte de matrícula:',
          error
        );
      }
    });
}
/*
 * Valida y registra el reporte de matrícula
 * correspondiente al periodo activo.
 */
saveEnrollmentData(
  onSuccess?: () => void,
  onFinish?: () => void
): void {
  if (this.isSaving) {
    return;
  }

  if (!this.idMapInstitucionPeriodo) {
    
    this.showSaveMessage(
      'No se encontró un periodo activo para la institución.',
      'error'
    );

    onFinish?.();
    return;
  }

  const user = this.authService.currentUser();

  if (!user?.id) {
    this.showSaveMessage(
      'No se encontró el usuario de la sesión.',
      'error'
    );

    onFinish?.();
    return;
  }

  if (
    this.matriculaTotal === null ||
    this.matriculaHombres === null ||
    this.matriculaMujeres === null ||
    this.matriculaTsu === null ||
    this.matriculaLicenciatura === null ||
    this.matriculaPostgrado === null ||
    this.tasaDesercion === null ||
    this.tasaReprobacion === null ||
    this.tasaEficienciaTerminal === null
  ) {
    this.showSaveMessage(
      'Completa todos los campos antes de guardar.',
      'error'
    );

    onFinish?.();
    return;
  }

  if (
    this.matriculaHombres + this.matriculaMujeres !==
    this.matriculaTotal
  ) {
    this.showSaveMessage(
      'La suma de hombres y mujeres debe coincidir con la matrícula total.',
      'error'
    );

    onFinish?.();
    return;
  }

  if (
    this.matriculaTsu +
      this.matriculaLicenciatura +
      this.matriculaPostgrado !==
    this.matriculaTotal
  ) {
    this.showSaveMessage(
      'La suma de TSU, licenciatura y posgrado debe coincidir con la matrícula total.',
      'error'
    );

    onFinish?.();
    return;
  }

  const request: CreateReporteMatriculaRequest = {
    idMapInstitucionPeriodo: this.idMapInstitucionPeriodo,
    intTotal: this.matriculaTotal,
    intTotalHombres: this.matriculaHombres,
    intTotalMujeres: this.matriculaMujeres,
    intTsu: this.matriculaTsu,
    intLicenciatura: this.matriculaLicenciatura,
    intPostgrado: this.matriculaPostgrado,
    decimalTazaDesercion: this.tasaDesercion,
    decimalTazaReprobacion: this.tasaReprobacion,
    decimalTazaEficienciaTerminal: this.tasaEficienciaTerminal,
    idUsuarioRegistro: user.id
  };

  /*
 * Si ya existe un reporte y está en modo edición,
 * actualiza la información mediante PUT.
 */
if (this.reportSaved && this.isEditing) {
  const updateRequest: UpdateReporteMatriculaRequest = {
    idMapInstitucionPeriodo:
      this.idMapInstitucionPeriodo,

    intTotal:
      this.matriculaTotal,

    intTotalHombres:
      this.matriculaHombres,

    intTotalMujeres:
      this.matriculaMujeres,

    intTsu:
      this.matriculaTsu,

    intLicenciatura:
      this.matriculaLicenciatura,

    intPostgrado:
      this.matriculaPostgrado,

    decimalTazaDesercion:
      this.tasaDesercion,

    decimalTazaReprobacion:
      this.tasaReprobacion,

    decimalTazaEficienciaTerminal:
      this.tasaEficienciaTerminal
  };

  this.updateEnrollmentData(
    updateRequest,
    onSuccess,
    onFinish
  );

  return;
}

  this.isSaving = true;
  this.saveMessage = '';

this.institutionalInformationService
  .createReporteMatricula(request)
  .pipe(
    finalize(() => {
        // Libera siempre el estado interno del componente hijo.
      this.isSaving = false;

      // Notifica al padre que la petición terminó.
      onFinish?.();

      // Actualiza inmediatamente el botón de la pantalla.
      this.cdr.detectChanges();
     
    })
  )
  .subscribe({
    next: (response) => {
      if (!response.data) {
        this.showSaveMessage(
          'No fue posible guardar el reporte de matrícula.',
          'error'
        );

        return;
      }

      this.reportSaved = true;

      this.fechaRegistro = new Date(
        response.data.dateTimeFechaRegistro
      ).toLocaleDateString('es-MX');

      this.showSaveMessage(
        'Reporte de matrícula guardado correctamente.',
        'success'
      );

       // Vuelve a consultar los datos oficiales guardados.
      this.loadReporteMatricula();
      this.loadComparison();

      onSuccess?.();
    },
    error: (error: HttpErrorResponse) => {
      console.error(
        'Error guardando el reporte de matrícula:',
        error
      );

      const message =
        error.error?.message ??
        'No se pudo guardar el reporte de matrícula.';

      this.showSaveMessage(
        message,
        'error'
      );
    }
  });
}
/*
 * Actualiza un reporte de matrícula existente.
 */
private updateEnrollmentData(
  request: UpdateReporteMatriculaRequest,
  onSuccess?: () => void,
  onFinish?: () => void
): void {
  this.isSaving = true;
  this.saveMessage = '';

  this.institutionalInformationService
    .updateReporteMatricula(request)
    .pipe(
      finalize(() => {
        // Libera siempre el botón al terminar el PUT.
        this.isSaving = false;
        onFinish?.();
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response) => {
        if (!response.data) {
          this.showSaveMessage(
            'No fue posible actualizar el reporte de matrícula.',
            'error'
          );

          return;
        }

        this.reportSaved = true;
        this.isEditing = false;
        this.originalValues = null;

        this.showSaveMessage(
          'Reporte de matrícula actualizado correctamente.',
          'success'
        );

        // Recarga la información oficial guardada.
        this.loadReporteMatricula();
        this.loadComparison();

        onSuccess?.();
      },
      error: (error: HttpErrorResponse) => {
        console.error(
          'Error actualizando el reporte de matrícula:',
          error
        );

        const message =
          error.error?.message ??
          'No se pudo actualizar el reporte de matrícula.';

        this.showSaveMessage(
          message,
          'error'
        );
      }
    });
}
/*
 * Muestra mensajes de éxito o error
 * dentro del formulario de matrícula.
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
  /*
   * Consulta el comparativo de matrícula
   * contra el periodo anterior.
   */
  loadComparison(): void {
    if (!this.idMapInstitucionPeriodo) {
      return;
    }

    this.isLoadingComparison = true;
    this.comparisonError = '';

    this.institutionalInformationService
      .getReporteMatriculaComparativo(
        this.idMapInstitucionPeriodo
      )
      .subscribe({
        next: (response) => {
          const comparison = response.data;

          if (!comparison) {
            this.comparisonError =
              'No fue posible obtener el comparativo.';

            this.isLoadingComparison = false;
            return;
          }

          this.previousPeriod =
            comparison.periodoAnterior;

          this.currentPeriod =
            comparison.periodoActual;

          this.difference =
            comparison.diferencia;

          this.percentage =
            comparison.porcentaje;

          this.comparisonStatus =
            comparison.estado;

          // Muestra el periodo actual en el campo no editable.
          this.periodo =
            comparison.periodoActual;

          this.isLoadingComparison = false;
        },
       error: (error: HttpErrorResponse) => {
          console.error(
            'Error consultando el comparativo de matrícula:',
            error
          );

          this.comparisonError =
            'No se pudo consultar el comparativo de matrícula.';

          this.isLoadingComparison = false;
        }
      });
  }
}
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService }
  from '../../../core/services/auth/authService';

import { InstitutionalInformationService }
  from '../../../core/services/institutional-information/institutional-information.service';

import { CatalogService }
  from '../../../core/services/catalogs/catalog.service';

import { InternetResponse }
  from '../../../shared/models/catalogs/responses/internetResponse';

import { DiscapacitadoResponse }
  from '../../../shared/models/catalogs/responses/discapacitadoResponse';
  import { CreateReporteInfraestructuraRequest }
from '../../../shared/models/institutional-information/infrastructure/requests/createReporteInfraestructuraRequest';

import { UpdateReporteInfraestructuraRequest }
from '../../../shared/models/institutional-information/infrastructure/requests/updateReporteInfraestructuraRequest';


  import { BarChartComponent }
  from '../../../shared/ui/charts/bar-chart/bar-chart';

@Component({
  selector: 'app-infrastructure-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BarChartComponent
    
  ],
  templateUrl: './infrastructure-data.html',
  styleUrl: './infrastructure-data.scss'
})
export class InfrastructureDataComponent implements OnInit {

  /*
   * Servicio encargado de consumir los endpoints
   * del Registro de Información Institucional.
   */
  private institutionalInformationService =
    inject(InstitutionalInformationService);

  /*
   * Servicio utilizado para obtener la información
   * del usuario que inició sesión.
   */
  private authService =
    inject(AuthService);

  /*
   * Servicio encargado de consultar
   * los catálogos del sistema.
   */
  private catalogService =
    inject(CatalogService);

  /*
   * Permite actualizar manualmente la vista
   * después de recibir información del backend.
   */
  private cdr =
    inject(ChangeDetectorRef);

  /*
   * Relación entre la institución del usuario
   * y el periodo activo.
   */
  idMapInstitucionPeriodo: number | null = null;

  /*
   * Nombre del periodo activo
   * mostrado dentro del formulario.
   */
  periodo = '';

  /*
   * Fecha en la que fue registrado
   * el reporte de infraestructura.
   */
  fechaRegistro = '';

  /*
   * Vista activa del componente:
   * captura o previsualización.
   */
  activeView: 'capture' | 'preview' =
    'capture';

  /*
   * Catálogo de opciones relacionadas
   * con el acceso a internet.
   */
  internet: InternetResponse[] = [];

  /*
   * Catálogo de opciones relacionadas
   * con instalaciones para personas con discapacidad.
   */
  discapacitados: DiscapacitadoResponse[] = [];

  /*
   * Indica si ya existe un reporte
   * registrado para el periodo activo.
   */
  reportSaved = false;

  /*
   * Indica si el usuario está modificando
   * un reporte previamente registrado.
   */
  isEditing = false;

  /*
   * Evita múltiples solicitudes mientras
   * se guarda o actualiza la información.
   */
  isSaving = false;

  /*
   * Indica si el componente se encuentra
   * cargando información.
   */
  isLoading = false;

  /*
   * Mensaje mostrado dentro
   * del formulario.
   */
  saveMessage = '';

  /*
   * Tipo del mensaje mostrado:
   * éxito o error.
   */
  saveMessageType:
    'success' | 'error' =
    'success';

  /*
   * Información capturada dentro
   * del reporte de infraestructura.
   */
  infrastructureReport = {

    totalAulas:
      null as number | null,

    totalLaboratorios:
      null as number | null,

    totalTalleres:
      null as number | null,

    biblioteca:
      false,

    totalBibliotecas:
      null as number | null,

    totalComputo:
      null as number | null,

    idInternet:
      null as number | null,

    idDiscapacitado:
      null as number | null

  };

  /*
   * Respaldo de la información utilizada
   * para restaurar los valores al cancelar una edición.
   */
  private originalValues:
    typeof this.infrastructureReport | null =
    null;

  /*
   * Inicializa la información necesaria
   * para mostrar el formulario.
   */
  ngOnInit(): void {

    this.loadActivePeriod();

    this.loadInternet();

    this.loadDiscapacitados();

  }

  /*
   * Obtiene el periodo activo
   * de la institución asignada al usuario.
   */
  private loadActivePeriod(): void {

    const idInstitucion =
      this.authService.currentUser()
        ?.idInstitucion;

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

          this.loadReporteInfraestructura();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(error);

          this.showError(
            'No fue posible obtener el periodo activo.'
          );

        }

      });

  }

  /*
   * Obtiene el catálogo de opciones
   * relacionadas con el acceso a internet.
   */
  private loadInternet(): void {

    this.catalogService
      .getInternet()
      .subscribe({

        next: (response) => {

          this.internet =
            response.data ?? [];

          this.cdr.detectChanges();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(error);

          this.showError(
            'No fue posible cargar el catálogo de acceso a internet.'
          );

        }

      });

  }

  /*
   * Obtiene el catálogo de opciones
   * relacionadas con las instalaciones
   * para personas con discapacidad.
   */
  private loadDiscapacitados(): void {

    this.catalogService
      .getDiscapacitados()
      .subscribe({

        next: (response) => {

          this.discapacitados =
            response.data ?? [];

          this.cdr.detectChanges();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(error);

          this.showError(
            'No fue posible cargar el catálogo de instalaciones para personas con discapacidad.'
          );

        }

      });

  }

  /*
 * Consulta si ya existe un reporte
 * registrado para el periodo activo.
 */
private loadReporteInfraestructura(): void {

  if (!this.idMapInstitucionPeriodo) {
    return;
  }

  this.institutionalInformationService
    .getReporteInfraestructura(
      this.idMapInstitucionPeriodo
    )
    .subscribe({

      next: (response) => {

        const reporte = response.data;

        if (!reporte) {
          return;
        }

        /*
         * Confirma que ya existe
         * un reporte registrado.
         */
        this.reportSaved = true;

        /*
         * Llena el formulario con la
         * información obtenida del backend.
         */
        this.infrastructureReport = {

          totalAulas:
            reporte.intTotalAulas,

          totalLaboratorios:
            reporte.intTotalLaboratorios,

          totalTalleres:
            reporte.intTotalTalleres,

          biblioteca:
            reporte.bitBiblioteca,

          totalBibliotecas:
            reporte.intTotalBibliotecas,

          totalComputo:
            reporte.intTotalComputo,

          idInternet:
            reporte.idInternet,

          idDiscapacitado:
            reporte.idDiscapacitado

            /*
            * Guarda una copia de la información
            * obtenida para poder restaurarla si
            * el usuario cancela la edición.
            */
        };
         this.originalValues = {
         ...this.infrastructureReport
        };

        /*
         * Muestra la fecha en la que
         * fue registrado el reporte.
         */
        this.fechaRegistro =
          new Date(
            reporte.dateTimeFechaRegistro
          ).toLocaleDateString('es-MX');

        this.cdr.detectChanges();

      },

      error: (error: HttpErrorResponse) => {

        /*
         * Si aún no existe un reporte,
         * simplemente continúa.
         */
        if (error.status === 404) {
          return;
        }

        console.error(error);

        this.showError(
          'No fue posible consultar el reporte de infraestructura.'
        );

      }

    });

}

  /*
   * Valida que los campos obligatorios
   * tengan un valor capturado.
   */
  private validateRequiredFields(): boolean {

    if (
      this.infrastructureReport.totalAulas === null ||
      this.infrastructureReport.totalLaboratorios === null ||
      this.infrastructureReport.totalTalleres === null ||
      this.infrastructureReport.totalComputo === null ||
      this.infrastructureReport.idInternet === null ||
      this.infrastructureReport.idDiscapacitado === null
    ) {

      this.validationError(
        'Todos los campos obligatorios deben ser capturados.'
      );

      return false;

    }

    /*
     * Si la institución cuenta con biblioteca,
     * debe indicar cuántas tiene.
     */
    if (
      this.infrastructureReport.biblioteca &&
      this.infrastructureReport.totalBibliotecas === null
    ) {

      this.validationError(
        'Debe indicar el total de bibliotecas.'
      );

      return false;

    }

    return true;

  }

  /*
   * Valida que los valores numéricos
   * no sean negativos.
   */
  private validateNegativeValues(): boolean {

    const valores = [

      this.infrastructureReport.totalAulas,

      this.infrastructureReport.totalLaboratorios,

      this.infrastructureReport.totalTalleres,

      this.infrastructureReport.totalBibliotecas,

      this.infrastructureReport.totalComputo

    ];

    const existeNegativo =
      valores.some(valor =>
        valor !== null && valor < 0
      );

    if (existeNegativo) {

      this.validationError(
        'Los valores numéricos no pueden ser negativos.'
      );

      return false;

    }

    return true;

  }

  /*
   * Ejecuta todas las validaciones
   * antes de guardar la información.
   */
  private validateInfrastructureData(): boolean {

    if (!this.validateRequiredFields()) {
      return false;
    }

    if (!this.validateNegativeValues()) {
      return false;
    }

    return true;

  }

  /*
   * Muestra un mensaje cuando
   * alguna validación no se cumple.
   */
  private validationError(
    message: string
  ): void {

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
   * Construye la solicitud para crear
   * un nuevo reporte de infraestructura.
   */
  private buildCreateRequest(): CreateReporteInfraestructuraRequest {

    return {

      idMapInstitucionPeriodo:
        this.idMapInstitucionPeriodo!,

      intTotalAulas:
        this.infrastructureReport.totalAulas!,

      intTotalLaboratorios:
        this.infrastructureReport.totalLaboratorios!,

      intTotalTalleres:
        this.infrastructureReport.totalTalleres!,

      bitBiblioteca:
        this.infrastructureReport.biblioteca,

      intTotalBibliotecas:
        this.infrastructureReport.totalBibliotecas ?? 0,

      intTotalComputo:
        this.infrastructureReport.totalComputo!,

      idInternet:
        this.infrastructureReport.idInternet!,

      idDiscapacitado:
        this.infrastructureReport.idDiscapacitado!,

        
idUsuarioRegistro:
  String(
    this.authService.currentUser()?.id ?? ''
  )
    };

  }

  /*
   * Construye la solicitud para actualizar
   * un reporte previamente registrado.
   */
  private buildUpdateRequest(): UpdateReporteInfraestructuraRequest {

    return {

      idMapInstitucionPeriodo:
        this.idMapInstitucionPeriodo!,

      intTotalAulas:
        this.infrastructureReport.totalAulas!,

      intTotalLaboratorios:
        this.infrastructureReport.totalLaboratorios!,

      intTotalTalleres:
        this.infrastructureReport.totalTalleres!,

      bitBiblioteca:
        this.infrastructureReport.biblioteca,

      intTotalBibliotecas:
        this.infrastructureReport.totalBibliotecas ?? 0,

      intTotalComputo:
        this.infrastructureReport.totalComputo!,

      idInternet:
        this.infrastructureReport.idInternet!,

      idDiscapacitado:
        this.infrastructureReport.idDiscapacitado!

    };

  }

  /*
   * Guarda la información capturada.
   * Si el reporte ya existe se actualiza,
   * en caso contrario se crea uno nuevo.
   */
  saveInfrastructureData(): void {

    if (this.isSaving) {
      return;
    }

    if (!this.validateInfrastructureData()) {
      return;
    }

    this.isSaving = true;

    if (this.reportSaved) {

      this.updateInfrastructureData();

    } else {

      this.createInfrastructureData();

    }

  }

    /*
   * Registra un nuevo reporte
   * de infraestructura.
   */
  private createInfrastructureData(): void {

    const request =
      this.buildCreateRequest();

    this.institutionalInformationService
      .createReporteInfraestructura(request)
      .subscribe({

        next: (response) => {

          this.reportSaved = true;

          this.isEditing = false;

          this.activeView = 'capture';

          this.originalValues = {
            ...this.infrastructureReport
          };

          this.showSaveMessage(
            response.message ||
            'La información se guardó correctamente.',
            'success'
          );

          this.isSaving = false;

          this.cdr.detectChanges();

        },

        error: (error: HttpErrorResponse) => {

          console.error(error);

          this.showError(
            error.error?.message ??
            'No fue posible guardar la información.'
          );

          this.isSaving = false;

        }

      });

  }

  /*
   * Actualiza un reporte
   * previamente registrado.
   */
  private updateInfrastructureData(): void {

    const request =
      this.buildUpdateRequest();

    this.institutionalInformationService
      .updateReporteInfraestructura(request)
      .subscribe({

        next: (response) => {

          this.isEditing = false;
          this.activeView = 'capture';

          this.originalValues = {
            ...this.infrastructureReport
          };

          this.showSaveMessage(
            response.message ||
            'La información se actualizó correctamente.',
            'success'
          );

          this.isSaving = false;

          this.cdr.detectChanges();

        },

        error: (error: HttpErrorResponse) => {

          console.error(error);

          this.showError(
            error.error?.message ??
            'No fue posible actualizar la información.'
          );

          this.isSaving = false;

        }

      });

  }

  /*
   * Habilita el modo edición
   * del formulario.
   */
  enableEdit(): void {

    this.originalValues = {
      ...this.infrastructureReport
    };

    this.isEditing = true;

  }

  /*
   * Cancela la edición y restaura
   * los valores originales.
   */
  cancelEdit(): void {

    if (this.originalValues) {

      this.infrastructureReport = {
        ...this.originalValues
      };

    }

    this.isEditing = false;

    this.cdr.detectChanges();

  }

  /*
   * Muestra un mensaje de éxito
   * después de guardar o actualizar.
   */
  private showSaveMessage(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.saveMessage = message;

    this.saveMessageType = type;

    this.cdr.detectChanges();

    setTimeout(() => {

      this.saveMessage = '';

      this.cdr.detectChanges();

    }, 4000);

  }

  /*
 * Muestra la pantalla de captura
 * del reporte de infraestructura.
 */
showCapture(): void {

  this.activeView = 'capture';

}

/*
 * Muestra la vista previa con el resumen
 * y las gráficas de infraestructura.
 */
showPreview(): void {

  this.activeView = 'preview';

}

/*
 * Limpia el total de bibliotecas cuando
 * la institución indica que no cuenta con biblioteca.
 */
onBibliotecaChange(
  cuentaConBiblioteca: boolean
): void {

  if (!cuentaConBiblioteca) {

    this.infrastructureReport.totalBibliotecas = 0;

  }

}

/*
 * Obtiene el nombre correspondiente
 * a la opción de acceso a internet seleccionada.
 */
getInternetName(): string {

  const opcion =
    this.internet.find(
      item =>
        item.id ===
        this.infrastructureReport.idInternet
    );

  return opcion?.strValor ??
    'Sin seleccionar';

}

/*
 * Obtiene el nombre correspondiente
 * a la opción de accesibilidad seleccionada.
 */
getDiscapacitadoName(): string {

  const opcion =
    this.discapacitados.find(
      item =>
        item.id ===
        this.infrastructureReport.idDiscapacitado
    );

  return opcion?.strValor ??
    'Sin seleccionar';

}

  /*
   * Muestra un mensaje de error
   * dentro del formulario.
   */
  private showError(
    message: string
  ): void {

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

}
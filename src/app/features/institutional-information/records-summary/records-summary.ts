import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReporteInfraestructuraComparativoResponse } from '../../../shared/models/institutional-information/infrastructure/responses/reporteInfraestructuraComparativoResponse';

import { InstitutionalInformationService } from '../../../core/services/institutional-information/institutional-information.service';

import { MapInstitucionPeriodoResponse } from '../../../shared/models/institutional-information/institution-period/responses/mapInstitucionPeriodoResponse';

import { ReporteMatriculaComparativoResponse } from '../../../shared/models/institutional-information/enrollment/responses/reporteMatriculaComparativoResponse';
import { ReporteFinanzaComparativoResponse }
  from '../../../shared/models/institutional-information/finance/responses/reporteFinanzaComparativoResponse';
import { ReporteVinculacionComparativoResponse } from '../../../shared/models/institutional-information/vinculation/responses/reporteVinculacionComparativoResponse';
import { ReportePatenteComparativoResponse }
  from '../../../shared/models/institutional-information/patent/responses/reportePatenteComparativoResponse';

type ModuloInstitucional =
  | 'matricula'
  | 'personal'
  | 'infraestructura'
  | 'finanzas'
  | 'vinculacion'
  | 'patentes';

interface ModuloInstitucionalOption {
  value: ModuloInstitucional;
  label: string;
}

/*
 * Visualización histórica de los registros
 * de información institucional.
 */
@Component({
  selector: 'app-records-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './records-summary.html',
  styleUrl: './records-summary.scss'
})
export class RecordsSummaryComponent implements OnInit {
  /*
   * Consulta el comparativo del módulo
   * y los periodos seleccionados.
   */
  comparePeriods(): void {
    const baseId = this.periodoBaseId();
    const comparisonId =
      this.periodoComparacionId();

    if (
      baseId === null ||
      comparisonId === null ||
      baseId === comparisonId
    ) {
      this.showNotification(
        'Selecciona dos periodos diferentes.',
        'error'
      );

      return;
    }

    const modulo = this.moduloSeleccionado();

    /*
     * Módulos disponibles actualmente.
     */
    if (
      modulo !== 'matricula' &&
      modulo !== 'personal' &&
      modulo !== 'infraestructura' &&
      modulo !== 'finanzas' &&
      modulo !== 'vinculacion' &&
      modulo !== 'patentes'
    ) {
      this.showNotification(
        'El comparativo del módulo seleccionado todavía no está disponible.',
        'error'
      );

      return;
    }

    this.isComparing.set(true);
    this.comparisonResult.set(null);
    this.infrastructureComparisonResults.set([]);
    this.financeComparisonResults.set([]);
    this.vinculationComparisonResults.set([]);
    this.patentComparisonResults.set([]);
    this.notificationMessage.set('');

    /*
     * Comparativo de Matrícula.
     */
    if (modulo === 'matricula') {
      this.institutionalInformationService
        .getReporteMatriculaComparativo(
          baseId,
          comparisonId
        )
        .subscribe({
          next: (response) => {
            const comparison = response.data;

            if (!comparison) {
              this.handleEmptyComparison(
                response.message
              );

              return;
            }

            this.comparisonResult.set(comparison);
            this.isComparing.set(false);
          },
          error: (error) => {
            this.handleComparisonError(
              error,
              'matrícula'
            );
          }
        });

      return;
    }

    /*
     * Comparativo de Personal.
     */
    if (modulo === 'personal') {
      this.institutionalInformationService
        .getReportePersonalComparativo(
          baseId,
          comparisonId
        )
        .subscribe({
          next: (response) => {
            const comparison = response.data;

            if (!comparison) {
              this.handleEmptyComparison(
                response.message
              );

              return;
            }

            /*
             * Adapta Personal al formato visual
             * utilizado por Matrícula.
             */
            this.comparisonResult.set({
              periodoActual:
                comparison.periodoActual,

              matriculaActual:
                comparison.totalPersonalActual,

              periodoAnterior:
                comparison.periodoAnterior,

              matriculaAnterior:
                comparison.totalPersonalAnterior,

              diferencia:
                comparison.diferencia,

              porcentaje:
                comparison.porcentaje,

              estado:
                comparison.estado
            });

            this.isComparing.set(false);
          },
          error: (error) => {
            this.handleComparisonError(
              error,
              'personal'
            );
          }
        });

      return;
    }

    /*
    * Comparativo de Infraestructura.
    */
    if (modulo === 'infraestructura') {
      this.institutionalInformationService
        .getReporteInfraestructuraComparativo(
          baseId,
          comparisonId
        )
        .subscribe({
          next: (response) => {
            const comparisons =
              response.data ?? [];

            if (comparisons.length === 0) {
              this.handleEmptyComparison(
                response.message
              );

              return;
            }

            this.infrastructureComparisonResults.set(
              comparisons
            );

            this.isComparing.set(false);
          },
          error: (error) => {
            this.handleComparisonError(
              error,
              'infraestructura'
            );
          }
        });

      return;
    }

    /*
 * Comparativo de Finanzas.
 */
if (modulo === 'finanzas') {
  this.institutionalInformationService
    .getReporteFinanzaComparativo(
      baseId,
      comparisonId
    )
    .subscribe({
      next: (response) => {
        const comparisons =
          response.data ?? [];

        if (comparisons.length === 0) {
          this.handleEmptyComparison(
            response.message
          );

          return;
        }

        this.financeComparisonResults.set(
          comparisons
        );

        this.isComparing.set(false);
      },
      error: (error) => {
        this.handleComparisonError(
          error,
          'finanzas'
        );
      }
    });

  return;
}

/*
 * Comparativo de Vinculación y resultados.
 */
if (modulo === 'vinculacion') {
  this.institutionalInformationService
    .getReporteVinculacionComparativo(
      baseId,
      comparisonId
    )
    .subscribe({
      next: (response) => {
        const comparisons =
          response.data ?? [];

        if (comparisons.length === 0) {
          this.handleEmptyComparison(
            response.message
          );

          return;
        }

        this.vinculationComparisonResults.set(
          comparisons
        );

        this.isComparing.set(false);
      },
      error: (error) => {
        this.handleComparisonError(
          error,
          'vinculación'
        );
      }
    });

  return;
}

/*
 * Comparativo de Patentes.
 */
this.institutionalInformationService
  .getReportePatenteComparativo(
    baseId,
    comparisonId
  )
  .subscribe({
    next: (response) => {
      const comparisons =
        response.data ?? [];

      if (comparisons.length === 0) {
        this.handleEmptyComparison(
          response.message
        );

        return;
      }

      this.patentComparisonResults.set(
        comparisons
      );

      this.isComparing.set(false);
    },
    error: (error) => {
      this.handleComparisonError(
        error,
        'patentes'
      );
    }
  });
}

  /*
   * Muestra el mensaje devuelto cuando alguno
   * de los periodos no contiene información.
   */
  private handleEmptyComparison(
    message: string | null | undefined
  ): void {
    this.showNotification(
      message ??
      'No existen datos suficientes para realizar la comparación.',
      'error'
    );

    this.isComparing.set(false);
  }

  /*
   * Controla los errores producidos
   * al consultar un comparativo.
   */
  private handleComparisonError(
    error: any,
    moduleName: string
  ): void {
    console.error(
      `Error consultando el comparativo de ${moduleName}:`,
      error
    );

    this.showNotification(
      error.error?.message ??
      'No fue posible comparar los periodos seleccionados.',
      'error'
    );

    this.isComparing.set(false);
  }

  private institutionalInformationService =
    inject(InstitutionalInformationService);

  readonly modulos: ReadonlyArray<
    ModuloInstitucionalOption
  > = [
      {
        value: 'matricula',
        label: 'Matrícula'
      },
      {
        value: 'personal',
        label: 'Personal'
      },
      {
        value: 'infraestructura',
        label: 'Infraestructura'
      },
      {
        value: 'finanzas',
        label: 'Finanzas'
      },
      {
        value: 'vinculacion',
        label: 'Vinculación y resultados'
      },
      {
        value: 'patentes',
        label: 'Patentes'
      }
    ];

  periodos = signal<MapInstitucionPeriodoResponse[]>([]);

  moduloSeleccionado =
    signal<ModuloInstitucional>('matricula');

  periodoBaseId = signal<number | null>(null);

  periodoComparacionId = signal<number | null>(null);

  isLoading = signal(false);
  /*
 * Resultado obtenido al comparar
 * los dos periodos seleccionados.
 */
  comparisonResult =
    signal<ReporteMatriculaComparativoResponse | null>(
      null
    );
  /*
 * Indicadores obtenidos al comparar
 * la infraestructura de dos periodos.
 */
  infrastructureComparisonResults =
    signal<ReporteInfraestructuraComparativoResponse[]>(
      []
    );

  /*
 * Indicadores financieros obtenidos
 * al comparar dos periodos.
 */
  financeComparisonResults =
    signal<ReporteFinanzaComparativoResponse[]>(
      []
    );

  /*
 * Indicadores de Vinculación obtenidos
 * al comparar dos periodos.
 */
  vinculationComparisonResults =
    signal<ReporteVinculacionComparativoResponse[]>(
      []
    );

    /*
 * Resultado del total de patentes
 * comparado entre dos periodos.
 */
patentComparisonResults =
  signal<ReportePatenteComparativoResponse[]>(
    []
  );

  /*
   * Indica si el comparativo
   * se encuentra en proceso.
   */
  isComparing = signal(false);

  notificationMessage = signal('');

  notificationType =
    signal<'success' | 'error'>('success');

  /*
   * Nombre de la institución obtenido
   * de las asignaciones del usuario.
   */
  nombreInstitucion = computed(() =>
    this.periodos()[0]?.strInstitucion ?? ''
  );

  /*
 * Nombre del módulo seleccionado
 * para mostrarlo en el resultado.
 */
  nombreModuloComparativo = computed(() =>
    this.modulos.find(
      modulo =>
        modulo.value === this.moduloSeleccionado()
    )?.label ?? ''
  );

  /*
   * Unidad mostrada debajo del total
   * de cada periodo.
   */
  unidadComparativa = computed(() =>
    this.moduloSeleccionado() === 'personal'
      ? 'Personas registradas'
      : 'Estudiantes registrados'
  );

  /*
   * Nombre de la diferencia calculada.
   */
  etiquetaDiferencia = computed(() =>
    this.moduloSeleccionado() === 'personal'
      ? 'Diferencia de personal'
      : 'Diferencia de matrícula'
  );

  /*
   * Evita que el periodo base aparezca
   * como opción para compararse consigo mismo.
   */
  periodosDisponiblesComparacion = computed(() =>
    this.periodos().filter(
      periodo => periodo.id !== this.periodoBaseId()
    )
  );

  /*
   * Indica si existen dos periodos distintos
   * seleccionados para realizar la comparación.
   */
  puedeComparar = computed(() =>
    this.periodoBaseId() !== null &&
    this.periodoComparacionId() !== null &&
    this.periodoBaseId() !==
    this.periodoComparacionId()
  );

  ngOnInit(): void {
    this.loadPeriodos();
  }

  /*
   * Obtiene los periodos asignados
   * a la institución del usuario autenticado.
   */
  loadPeriodos(): void {
    this.isLoading.set(true);

    this.institutionalInformationService
      .getMapInstitucionPeriodosUsuario()
      .subscribe({
        next: (response) => {
          const periodos = response.data ?? [];

          this.periodos.set(periodos);
          this.setPeriodosIniciales(periodos);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error(
            'Error cargando periodos institucionales:',
            error
          );

          this.showNotification(
            'No fue posible cargar los periodos de la institución.',
            'error'
          );

          this.isLoading.set(false);
        }
      });
  }

  /*
   * Selecciona inicialmente el periodo más reciente
   * y el periodo inmediatamente anterior.
   */
  private setPeriodosIniciales(
    periodos: MapInstitucionPeriodoResponse[]
  ): void {
    this.periodoBaseId.set(
      periodos[0]?.id ?? null
    );

    this.periodoComparacionId.set(
      periodos[1]?.id ?? null
    );
  }

  onModuloChange(
    modulo: ModuloInstitucional
  ): void {
    this.moduloSeleccionado.set(modulo);

    /*
     * Evita conservar el resultado
     * perteneciente al módulo anterior.
     */
    this.comparisonResult.set(null);
    this.infrastructureComparisonResults.set([]);
    this.financeComparisonResults.set([]);
    this.vinculationComparisonResults.set([]);
    this.patentComparisonResults.set([]);
    this.notificationMessage.set('');
  }

  onPeriodoBaseChange(
    idPeriodo: number | null
  ): void {
    this.comparisonResult.set(null);
    this.infrastructureComparisonResults.set([]);
    this.financeComparisonResults.set([]);
    this.vinculationComparisonResults.set([]);
    this.patentComparisonResults.set([]);
    this.notificationMessage.set('');

    this.periodoBaseId.set(idPeriodo);

    if (
      idPeriodo !== null &&
      idPeriodo === this.periodoComparacionId()
    ) {
      const periodoAlternativo =
        this.periodos().find(
          periodo => periodo.id !== idPeriodo
        );

      this.periodoComparacionId.set(
        periodoAlternativo?.id ?? null
      );
    }
  }

  onPeriodoComparacionChange(
    idPeriodo: number | null
  ): void {
    this.comparisonResult.set(null);
    this.infrastructureComparisonResults.set([]);
    this.financeComparisonResults.set([]);
    this.vinculationComparisonResults.set([]);
    this.patentComparisonResults.set([]);
    this.notificationMessage.set('');

    this.periodoComparacionId.set(idPeriodo);
  }

  /*
   * Construye el nombre mostrado
   * dentro de los selectores de periodos.
   */
  periodoTexto(
    periodo: MapInstitucionPeriodoResponse
  ): string {
    return `${periodo.strPeriodo} - ${periodo.intAnio}`;
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
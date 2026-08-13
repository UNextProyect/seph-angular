import { ChangeDetectorRef, Component,  OnInit, ViewChild, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import {ActivatedRoute,RouterLink} from '@angular/router';import { EnrollmentDataComponent } from './enrollment-data/enrollment-data';
import { PersonalDataComponent } from './personal-data/personal-data';
import { InfrastructureDataComponent } from './infrastructure-data/infrastructure-data';
import { VinculationDataComponent } from './vinculation-data/vinculation-data';
import { FinanceDataComponent } from './finance-data/finance-data';
import { StrategicAnalysisDataComponent } from './strategic-analysis-data/strategic-analysis-data';
import { PatentDataComponent }from './patent-data/patent-data';
import { RecordsSummaryComponent }from './records-summary/records-summary';

@Component({
  selector: 'app-institutional-information',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RecordsSummaryComponent,
    EnrollmentDataComponent,
    PersonalDataComponent,
    InfrastructureDataComponent,
    FinanceDataComponent,
    VinculationDataComponent,
    StrategicAnalysisDataComponent,
    PatentDataComponent

  ],
  templateUrl: './institutional-information.html',
  styleUrl: './institutional-information.scss'
})
export class InstitutionalInformationComponent implements OnInit{

  /*
 * Permite identificar si la ruta actual
 * corresponde a comparación o captura.
 */
private activatedRoute =
  inject(ActivatedRoute);

/*
 * Indica si debe mostrarse la visualización
 * y comparación de registros institucionales.
 */
isComparisonView =
  this.activatedRoute.snapshot.data['view'] ===
  'comparison';

  /*
 * Abre el módulo indicado mediante
 * el parámetro step de la ruta.
 */
ngOnInit(): void {
  this.activatedRoute.queryParamMap
    .subscribe(params => {
      const stepParam = params.get('step');
      const step = Number(stepParam ?? 1);

      if (
        Number.isInteger(step) &&
        step >= 1 &&
        step <= 7
      ) {
        this.currentStep = step;
      } else {
        this.currentStep = 1;
      }
    });
}

  /*
   * Referencia al formulario de matrícula.
   * Permite ejecutar su método de guardado
   * desde el botón del componente contenedor.
   */
  @ViewChild(EnrollmentDataComponent)
  enrollmentDataComponent?: EnrollmentDataComponent;

  /*
   * Referencia al formulario de personal.
   * Permite ejecutar su método de guardado
   * desde el botón del componente contenedor.
   */
  @ViewChild(PersonalDataComponent)
  personalDataComponent?: PersonalDataComponent;

  /*
   * Referencia al formulario de infraestructura.
   * Permite ejecutar su método de guardado
   * desde el botón del componente contenedor.
   */
  @ViewChild(InfrastructureDataComponent)
  infrastructureDataComponent?: InfrastructureDataComponent;

  /*
   * Referencia al formulario de vinculación.
   * Permite ejecutar su método de guardado
   * desde el botón del componente contenedor.
   */
  @ViewChild(VinculationDataComponent)
  vinculationDataComponent?: VinculationDataComponent;

  /*
* Referencia al formulario de finanzas.
* Permite ejecutar su método de guardado
* desde el botón del componente contenedor.
*/
  @ViewChild(FinanceDataComponent)
  financeDataComponent?: FinanceDataComponent;

  /*
  * Referencia al formulario de análisis estratégico.
  * Permite ejecutar su método de guardado
  * desde el botón del componente contenedor.
  */
  @ViewChild(StrategicAnalysisDataComponent)
  strategicAnalysisDataComponent?: StrategicAnalysisDataComponent;

  /*
  * Referencia al componente de patentes.
  * Permite acceder a su información
  * desde el componente contenedor.
  */
  @ViewChild(PatentDataComponent)
  patentDataComponent?: PatentDataComponent;

  private cdr =
    inject(ChangeDetectorRef);

  /*
   * Controla si el menú lateral
   * se encuentra abierto o colapsado.
   */
  menuCollapsed = false;

  /*
   * Paso visible dentro del Registro
   * de Información Institucional.
   */
  currentStep = 1;

  /*
   * Indica si la información de matrícula
   * ya fue registrada.
   */
  enrollmentCompleted = false;

  /*
   * Indica si la información de personal
   * ya fue registrada.
   */
  personalCompleted = false;

  /*
   * Evita varios clics mientras
   * se guarda la información.
   */
  isSaving = false;

  /*
   * Mensaje mostrado por
   * el componente contenedor.
   */
  notificationMessage = '';

  /*
   * Tipo del mensaje mostrado.
   */
  notificationType:
    'success' | 'error' =
    'success';

  /*
   * Expande o colapsa
   * el menú lateral.
   */
  toggleMenu(): void {

    this.menuCollapsed =
      !this.menuCollapsed;

  }

  /*
   * Cambia el módulo mostrado
   * dentro del formulario.
   */
  goToStep(
    step: number
  ): void {
     console.log('Paso seleccionado:', step);

    if (step === 1) {

      this.currentStep = step;

      return;

    }

    if (step === 2) {

      this.currentStep = step;

      return;

    }

    /*
     * Infraestructura corresponde
     * al paso 3.
     */
    if (step === 3) {

      this.currentStep = step;

      return;

    }

    /*
    * Finanzas corresponde al paso 4.
    */
    if (step === 4) {

      this.currentStep = step;

      return;

    }

    /*
    * Vinculación corresponde al paso 5.
    */
    if (step === 5) {

      this.currentStep = step;
        return;

    }

    /*
    * Análisis Estratégico corresponde
    * al paso 6.
    */
    if (step === 6) {

      this.currentStep = step;
      return;

    }

    /*
    * Patentes corresponde
    * al paso 7.
    */
    if (step === 7) {

      this.currentStep = step;

      return;

}

  }

  /*
   * Ejecuta el guardado correspondiente
   * a la sección que se encuentra visible.
   */
  saveCurrentSection(): void {

    if (this.currentStep === 1) {

      this.saveEnrollmentSection();

      return;

    }

    if (this.currentStep === 2) {

      this.savePersonalSection();

      return;

    }

    if (this.currentStep === 3) {

      this.saveInfrastructureSection();

      return;

    }

    if (this.currentStep === 4) {

      this.saveFinanceSection();

      return;

    }

    if (this.currentStep === 5) {

      this.saveVinculationSection();

      return;

    }

    if (this.currentStep === 6) {

      this.saveStrategicAnalysisSection();

    }



  }

  /*
   * Guarda la información de matrícula
   * utilizando el componente hijo.
   */
  private saveEnrollmentSection(): void {

    if (
      this.isSaving ||
      !this.enrollmentDataComponent
    ) {

      return;

    }

    this.isSaving = true;

    this.cdr.detectChanges();

    this.enrollmentDataComponent
      .saveEnrollmentData(

        () => {

          this.enrollmentCompleted = true;

          this.showNotification(
            'Datos de matrícula guardados correctamente.',
            'success'
          );

          this.cdr.detectChanges();

        },

        () => {

          this.isSaving = false;

          this.cdr.detectChanges();

        }

      );

  }
  /*
  * Guarda la información del análisis estratégico
  * utilizando el componente hijo.
  */
  private saveStrategicAnalysisSection(): void {

    if (
      !this.strategicAnalysisDataComponent ||
      this.strategicAnalysisDataComponent.isSaving
    ) {

      return;

    }

    this.strategicAnalysisDataComponent
      .saveStrategicAnalysisData();

  }

  /*
   * Guarda la información de personal
   * utilizando el componente hijo.
   */
  private savePersonalSection(): void {

    if (
      this.isSaving ||
      !this.personalDataComponent
    ) {

      return;

    }

    this.isSaving = true;

    this.cdr.detectChanges();

    this.personalDataComponent
      .savePersonalData(

        () => {

          this.personalCompleted = true;

          this.isSaving = false;

          this.cdr.detectChanges();

        }

      );

  }

  /*
   * Guarda la información de infraestructura
   * utilizando el componente hijo.
   */
  private saveInfrastructureSection(): void {

    if (
      !this.infrastructureDataComponent ||
      this.infrastructureDataComponent.isSaving
    ) {

      return;

    }

    this.infrastructureDataComponent
      .saveInfrastructureData();

  }

  /*
* Guarda la información financiera
* utilizando el componente hijo.
*/
  private saveFinanceSection(): void {

    if (
      !this.financeDataComponent ||
      this.financeDataComponent.isSaving
    ) {

      return;

    }

    this.financeDataComponent
      .saveFinanceData();

  }

  /*
   * Guarda la información de vinculación
   * utilizando el componente hijo.
   */
  private saveVinculationSection(): void {

    if (
      !this.vinculationDataComponent ||
      this.vinculationDataComponent.isSaving
    ) {

      return;

    }

    this.vinculationDataComponent
      .saveVinculationData();

  }

  /*
   * Muestra una notificación dentro
   * del componente contenedor.
   */
  showNotification(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.notificationMessage =
      message;

    this.notificationType =
      type;

    setTimeout(() => {

      this.notificationMessage = '';

      this.cdr.detectChanges();

    }, 4000);

  }

}
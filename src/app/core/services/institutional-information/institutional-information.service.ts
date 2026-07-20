import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../../shared/models/apiResponse';
import { PeriodoActivoInstitucionResponse }
from '../../../shared/models/institutional-information/period/responses/periodoActivoInstitucionResponse';
import { ReporteMatriculaComparativoResponse }
  from '../../../shared/models/institutional-information/enrollment/responses/reporteMatriculaComparativoResponse';
import { ReporteMatriculaResponse }
  from '../../../shared/models/institutional-information/enrollment/responses/reporteMatriculaResponse';
import { CreateReporteMatriculaRequest }
  from '../../../shared/models/institutional-information/enrollment/requests/createReporteMatriculaRequest';
import { UpdateReporteMatriculaRequest }
  from '../../../shared/models/institutional-information/enrollment/requests/updateReporteMatriculaRequest';
  import { CreateReportePersonalRequest }
  from '../../../shared/models/institutional-information/personal/requests/createReportePersonalRequest';

import { UpdateReportePersonalRequest }
  from '../../../shared/models/institutional-information/personal/requests/updateReportePersonalRequest';

import { ReportePersonalResponse }
  from '../../../shared/models/institutional-information/personal/responses/reportePersonalResponse';

import { ReportePersonalComparativoResponse }
  from '../../../shared/models/institutional-information/personal/responses/reportePersonalComparativoResponse';

import { ReportePersonalEstadisticasResponse }
  from '../../../shared/models/institutional-information/personal/responses/reportePersonalEstadisticasResponse';

import { CreateReporteInfraestructuraRequest }
  from '../../../shared/models/institutional-information/infrastructure/requests/createReporteInfraestructuraRequest';

import { UpdateReporteInfraestructuraRequest }
  from '../../../shared/models/institutional-information/infrastructure/requests/updateReporteInfraestructuraRequest';

import { ReporteInfraestructuraResponse }
  from '../../../shared/models/institutional-information/infrastructure/responses/reporteInfraestructuraResponse';

import { ReporteInfraestructuraComparativoResponse }
  from '../../../shared/models/institutional-information/infrastructure/responses/reporteInfraestructuraComparativoResponse';

import { ReporteInfraestructuraEstadisticasResponse }
  from '../../../shared/models/institutional-information/infrastructure/responses/reporteInfraestructuraEstadisticasResponse';

/* URL base del backend. */
const API_URL = 'https://localhost:7160/api/v1';

/*
 * Servicio encargado de consumir los endpoints
 * del Registro de Información Institucional.
 */
@Injectable({
  providedIn: 'root'
})
export class InstitutionalInformationService {

  // Cliente HTTP utilizado para las peticiones al backend.
  private http = inject(HttpClient);

  /*
   * Obtiene el comparativo del reporte de matrícula
   * contra el periodo anterior de la misma institución.
   */
  
  getReporteMatriculaComparativo(
    idMapInstitucionPeriodo: number
  ) {
    return this.http.get<
      ApiResponse<ReporteMatriculaComparativoResponse>
    >(
      `${API_URL}/Matricula/reporte-comparativo/${idMapInstitucionPeriodo}`
    );
  }
  getPeriodoActivo(idInstitucion: number) {
  return this.http.get<
    ApiResponse<PeriodoActivoInstitucionResponse>
  >(
    `${API_URL}/Matricula/periodo-activo/${idInstitucion}`
  );
}
/*
 * Obtiene el reporte guardado para
 * una relación institución-periodo.
 */
getReporteMatricula(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteMatriculaResponse>
  >(
    `${API_URL}/Matricula/reporte/${idMapInstitucionPeriodo}`
  );
}
/*
 * Registra el reporte de matrícula
 * correspondiente al periodo activo.
 */
createReporteMatricula(
  request: CreateReporteMatriculaRequest
) {
  return this.http.post<
    ApiResponse<ReporteMatriculaResponse>
  >(
    `${API_URL}/Matricula/reporte`,
    request
  );
}
/*
 * Actualiza el reporte de matrícula
 * correspondiente al periodo activo.
 */
updateReporteMatricula(
  request: UpdateReporteMatriculaRequest
) {
  return this.http.put<
    ApiResponse<ReporteMatriculaResponse>
  >(
    `${API_URL}/Matricula/reporte`,
    request
  );
}
/*
 * Obtiene el reporte de personal
 * registrado para un periodo institucional.
 */
getReportePersonal(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReportePersonalResponse>
  >(
    `${API_URL}/Personal/reporte/${idMapInstitucionPeriodo}`
  );
}
/*
 * Registra el reporte de personal.
 */
createReportePersonal(
  request: CreateReportePersonalRequest
) {
  return this.http.post<
    ApiResponse<ReportePersonalResponse>
  >(
    `${API_URL}/Personal/reporte`,
    request
  );
}
/*
 * Actualiza el reporte de personal.
 */
updateReportePersonal(
  request: UpdateReportePersonalRequest
) {
  return this.http.put<
    ApiResponse<ReportePersonalResponse>
  >(
    `${API_URL}/Personal/reporte`,
    request
  );
}
/*
 * Obtiene el comparativo del reporte
 * de personal con el periodo anterior.
 */
getReportePersonalComparativo(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReportePersonalComparativoResponse>
  >(
    `${API_URL}/Personal/reporte-comparativo/${idMapInstitucionPeriodo}`
  );
}
/*
 * Obtiene las estadísticas del
 * reporte de personal.
 */
getReportePersonalEstadisticas(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReportePersonalEstadisticasResponse>
  >(
    `${API_URL}/Personal/estadisticas/${idMapInstitucionPeriodo}`
  );
}

/*
 * Obtiene el reporte de infraestructura
 * registrado para un periodo institucional.
 */
getReporteInfraestructura(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteInfraestructuraResponse>
  >(
    `${API_URL}/Infraestructura/reporte/${idMapInstitucionPeriodo}`
  );
}

/*
 * Registra el reporte de infraestructura.
 */
createReporteInfraestructura(
  request: CreateReporteInfraestructuraRequest
) {
  return this.http.post<
    ApiResponse<ReporteInfraestructuraResponse>
  >(
    `${API_URL}/Infraestructura/reporte`,
    request
  );
}

/*
 * Actualiza el reporte de infraestructura.
 */
updateReporteInfraestructura(
  request: UpdateReporteInfraestructuraRequest
) {
  return this.http.put<
    ApiResponse<ReporteInfraestructuraResponse>
  >(
    `${API_URL}/Infraestructura/reporte`,
    request
  );
}

/*
 * Obtiene el comparativo del reporte
 * de infraestructura con el periodo anterior.
 */
getReporteInfraestructuraComparativo(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteInfraestructuraComparativoResponse[]>
  >(
    `${API_URL}/Infraestructura/reporte-comparativo/${idMapInstitucionPeriodo}`
  );
}

/*
 * Obtiene las estadísticas del
 * reporte de infraestructura.
 */
getReporteInfraestructuraEstadisticas(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteInfraestructuraEstadisticasResponse>
  >(
    `${API_URL}/Infraestructura/estadisticas/${idMapInstitucionPeriodo}`
  );
}

}
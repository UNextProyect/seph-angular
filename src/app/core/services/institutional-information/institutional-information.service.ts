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

import { CreateReporteVinculacionRequest }
  from '../../../shared/models/institutional-information/vinculation/requests/createReporteVinculacionRequest';

import { UpdateReporteVinculacionRequest }
  from '../../../shared/models/institutional-information/vinculation/requests/updateReporteVinculacionRequest';

import { ReporteVinculacionResponse }
  from '../../../shared/models/institutional-information/vinculation/responses/reporteVinculacionResponse';

import { ReporteVinculacionComparativoResponse }
  from '../../../shared/models/institutional-information/vinculation/responses/reporteVinculacionComparativoResponse';

import { ReporteVinculacionEstadisticasResponse }
  from '../../../shared/models/institutional-information/vinculation/responses/reporteVinculacionEstadisticasResponse';
  import { CreateReportePatenteRequest }
  from '../../../shared/models/institutional-information/patent/requests/createReportePatenteRequest';

import { UpdateReportePatenteRequest }
  from '../../../shared/models/institutional-information/patent/requests/updateReportePatenteRequest';

import { ReportePatenteResponse }
  from '../../../shared/models/institutional-information/patent/responses/reportePatenteResponse';

import { ReportePatenteComparativoResponse }
  from '../../../shared/models/institutional-information/patent/responses/reportePatenteComparativoResponse';

import { ReportePatenteEstadisticasResponse }
  from '../../../shared/models/institutional-information/patent/responses/reportePatenteEstadisticasResponse';
import { CreateReporteFinanzaRequest }
  from '../../../shared/models/institutional-information/finance/requests/createReporteFinanzaRequest';

import { UpdateReporteFinanzaRequest }
  from '../../../shared/models/institutional-information/finance/requests/updateReporteFinanzaRequest';

import { ReporteFinanzaResponse }
  from '../../../shared/models/institutional-information/finance/responses/reporteFinanzaResponse';

import { ReporteFinanzaComparativoResponse }
  from '../../../shared/models/institutional-information/finance/responses/reporteFinanzaComparativoResponse';

import { ReporteFinanzaEstadisticasResponse }
  from '../../../shared/models/institutional-information/finance/responses/reporteFinanzaEstadisticasResponse';
import { MapInstitucionPeriodoResponse }
  from '../../../shared/models/institutional-information/institution-period/responses/mapInstitucionPeriodoResponse';

import { CreateMapInstitucionPeriodoRequest }
  from '../../../shared/models/institutional-information/institution-period/requests/createMapInstitucionPeriodoRequest';

import { UpdateMapInstitucionPeriodoRequest }
  from '../../../shared/models/institutional-information/institution-period/requests/updateMapInstitucionPeriodoRequest';

  import { CreateReporteAnalisisEstrategicoRequest }
  from '../../../shared/models/institutional-information/strategic-analysis/requests/createReporteAnalisisEstrategicoRequest';

import { UpdateReporteAnalisisEstrategicoRequest }
  from '../../../shared/models/institutional-information/strategic-analysis/requests/updateReporteAnalisisEstrategicoRequest';

import { ReporteAnalisisEstrategicoResponse }
  from '../../../shared/models/institutional-information/strategic-analysis/responses/reporteAnalisisEstrategicoResponse';
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
 * Obtiene una patente
 * mediante su identificador.
 */
getReportePatente(
  id: number
) {
  return this.http.get<
    ApiResponse<ReportePatenteResponse>
  >(
    `${API_URL}/Patente/reporte/${id}`
  );
}

/*
 * Obtiene las patentes registradas
 * durante un periodo institucional.
 */
getReportesPatenteByPeriodo(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReportePatenteResponse[]>
  >(
    `${API_URL}/Patente/reportes-periodo/${idMapInstitucionPeriodo}`
  );
}

/*
 * Registra un reporte de patente.
 */
createReportePatente(
  request: CreateReportePatenteRequest
) {
  return this.http.post<
    ApiResponse<ReportePatenteResponse>
  >(
    `${API_URL}/Patente/reporte`,
    request
  );
}

/*
 * Actualiza un reporte de patente.
 */
updateReportePatente(
  request: UpdateReportePatenteRequest
) {
  return this.http.put<
    ApiResponse<ReportePatenteResponse>
  >(
    `${API_URL}/Patente/reporte`,
    request
  );
}

/*
 * Obtiene la comparación del total de patentes
 * entre dos periodos seleccionados.
 */
getReportePatenteComparativo(
  idMapPeriodoBase: number,
  idMapPeriodoComparacion: number
) {
  return this.http.get<
    ApiResponse<
      ReportePatenteComparativoResponse[]
    >
  >(
    `${API_URL}/Patente/reporte-comparativo/` +
    `${idMapPeriodoBase}/${idMapPeriodoComparacion}`
  );
}

/*
 * Obtiene las estadísticas
 * del reporte de patentes.
 */
getReportePatenteEstadisticas(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReportePatenteEstadisticasResponse>
  >(
    `${API_URL}/Patente/estadisticas/${idMapInstitucionPeriodo}`
  );
}

  /*
 * Obtiene el comparativo de matrícula
 * entre dos periodos seleccionados.
 */
getReporteMatriculaComparativo(
  idMapPeriodoBase: number,
  idMapPeriodoComparacion: number
) {
  return this.http.get<
    ApiResponse<ReporteMatriculaComparativoResponse>
  >(
    `${API_URL}/Matricula/reporte-comparativo/` +
    `${idMapPeriodoBase}/${idMapPeriodoComparacion}`
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
 * Obtiene la comparación de Personal
 * entre dos periodos seleccionados.
 */
getReportePersonalComparativo(
  idMapPeriodoBase: number,
  idMapPeriodoComparacion: number
) {
  return this.http.get<
    ApiResponse<ReportePersonalComparativoResponse>
  >(
    `${API_URL}/Personal/reporte-comparativo/` +
    `${idMapPeriodoBase}/${idMapPeriodoComparacion}`
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
 * Obtiene la comparación de Infraestructura
 * entre dos periodos seleccionados.
 */
getReporteInfraestructuraComparativo(
  idMapPeriodoBase: number,
  idMapPeriodoComparacion: number
) {
  return this.http.get<
    ApiResponse<
      ReporteInfraestructuraComparativoResponse[]
    >
  >(
    `${API_URL}/Infraestructura/reporte-comparativo/` +
    `${idMapPeriodoBase}/${idMapPeriodoComparacion}`
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

/*
 * Obtiene el reporte de vinculación
 * registrado para un periodo institucional.
 */
getReporteVinculacion(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteVinculacionResponse>
  >(
    `${API_URL}/Vinculacion/reporte/${idMapInstitucionPeriodo}`
  );
}

/*
 * Registra el reporte de vinculación.
 */
createReporteVinculacion(
  request: CreateReporteVinculacionRequest
) {
  return this.http.post<
    ApiResponse<ReporteVinculacionResponse>
  >(
    `${API_URL}/Vinculacion/reporte`,
    request
  );
}

/*
 * Actualiza el reporte de vinculación.
 */
updateReporteVinculacion(
  request: UpdateReporteVinculacionRequest
) {
  return this.http.put<
    ApiResponse<ReporteVinculacionResponse>
  >(
    `${API_URL}/Vinculacion/reporte`,
    request
  );
}

/*
 * Obtiene la comparación de Vinculación
 * entre dos periodos seleccionados.
 */
getReporteVinculacionComparativo(
  idMapPeriodoBase: number,
  idMapPeriodoComparacion: number
) {
  return this.http.get<
    ApiResponse<
      ReporteVinculacionComparativoResponse[]
    >
  >(
    `${API_URL}/Vinculacion/reporte-comparativo/` +
    `${idMapPeriodoBase}/${idMapPeriodoComparacion}`
  );
}

/*
 * Obtiene las estadísticas del
 * reporte de vinculación.
 */
getReporteVinculacionEstadisticas(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteVinculacionEstadisticasResponse>
  >(
    `${API_URL}/Vinculacion/estadisticas/${idMapInstitucionPeriodo}`
  );
}

/*
 * Obtiene el reporte financiero
 * registrado para un periodo institucional.
 */
getReporteFinanza(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteFinanzaResponse>
  >(
    `${API_URL}/Finanza/reporte/${idMapInstitucionPeriodo}`
  );
}

/*
 * Registra el reporte financiero.
 */
createReporteFinanza(
  request: CreateReporteFinanzaRequest
) {
  return this.http.post<
    ApiResponse<ReporteFinanzaResponse>
  >(
    `${API_URL}/Finanza/reporte`,
    request
  );
}

/*
 * Actualiza el reporte financiero.
 */
updateReporteFinanza(
  request: UpdateReporteFinanzaRequest
) {
  return this.http.put<
    ApiResponse<ReporteFinanzaResponse>
  >(
    `${API_URL}/Finanza/reporte`,
    request
  );
}

/*
 * Obtiene la comparación de Finanzas
 * entre dos periodos seleccionados.
 */
getReporteFinanzaComparativo(
  idMapPeriodoBase: number,
  idMapPeriodoComparacion: number
) {
  return this.http.get<
    ApiResponse<
      ReporteFinanzaComparativoResponse[]
    >
  >(
    `${API_URL}/Finanza/reporte-comparativo/` +
    `${idMapPeriodoBase}/${idMapPeriodoComparacion}`
  );
}

/*
 * Obtiene las estadísticas del
 * reporte financiero.
 */
getReporteFinanzaEstadisticas(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteFinanzaEstadisticasResponse>
  >(
    `${API_URL}/Finanza/estadisticas/${idMapInstitucionPeriodo}`
  );
}

/*
 * Obtiene todas las asignaciones
 * de periodos por institución.
 */
getMapInstitucionPeriodos() {
  return this.http.get<
    ApiResponse<MapInstitucionPeriodoResponse[]>
  >(
    `${API_URL}/MapInstitucionPeriodo`
  );
}

/*
 * Obtiene los periodos asignados
 * a la institución del usuario autenticado.
 */
getMapInstitucionPeriodosUsuario() {
  return this.http.get<
    ApiResponse<MapInstitucionPeriodoResponse[]>
  >(
    `${API_URL}/MapInstitucionPeriodo/usuario`
  );
}

/*
 * Obtiene una asignación de periodo
 * por su identificador.
 */
getMapInstitucionPeriodo(
  id: number
) {
  return this.http.get<
    ApiResponse<MapInstitucionPeriodoResponse>
  >(
    `${API_URL}/MapInstitucionPeriodo/${id}`
  );
}

/*
 * Asigna un periodo
 * a una institución.
 */
createMapInstitucionPeriodo(
  request: CreateMapInstitucionPeriodoRequest
) {
  return this.http.post<
    ApiResponse<MapInstitucionPeriodoResponse>
  >(
    `${API_URL}/MapInstitucionPeriodo`,
    request
  );
}

/*
 * Actualiza una asignación
 * de periodo institucional.
 */
updateMapInstitucionPeriodo(
  id: number,
  request: UpdateMapInstitucionPeriodoRequest
) {
  return this.http.put<
    ApiResponse<MapInstitucionPeriodoResponse>
  >(
    `${API_URL}/MapInstitucionPeriodo/${id}`,
    request
  );
}

/*
 * Obtiene el reporte de análisis estratégico
 * registrado para un periodo institucional.
 */
getReporteAnalisisEstrategico(
  idMapInstitucionPeriodo: number
) {
  return this.http.get<
    ApiResponse<ReporteAnalisisEstrategicoResponse>
  >(
    `${API_URL}/ReporteAnalisisEstrategico/reporte/${idMapInstitucionPeriodo}`
  );
}

/*
 * Registra el reporte
 * de análisis estratégico.
 */
createReporteAnalisisEstrategico(
  request: CreateReporteAnalisisEstrategicoRequest
) {
  return this.http.post<
    ApiResponse<ReporteAnalisisEstrategicoResponse>
  >(
    `${API_URL}/ReporteAnalisisEstrategico/reporte`,
    request
  );
}

/*
 * Actualiza el reporte
 * de análisis estratégico.
 */
updateReporteAnalisisEstrategico(
  request: UpdateReporteAnalisisEstrategicoRequest
) {
  return this.http.put<
    ApiResponse<ReporteAnalisisEstrategicoResponse>
  >(
    `${API_URL}/ReporteAnalisisEstrategico/reporte`,
    request
  );
}

}
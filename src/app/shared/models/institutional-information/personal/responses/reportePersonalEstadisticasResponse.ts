/*
 * Respuesta del backend con las estadísticas
 * calculadas del reporte de personal.
 */
export interface ReportePersonalEstadisticasResponse {
  periodo: string;

  totalGeneral: number;

  totalDirectivos: number;
  directivosHombres: number;
  directivosMujeres: number;

  totalAdministrativos: number;
  administrativosHombres: number;
  administrativosMujeres: number;

  totalDocentes: number;
  docentesHombres: number;
  docentesMujeres: number;

  docentesTiempoCompleto: number;
  docentesAsignatura: number;
  docentesHora: number;

  nivelAcademicoPredominante: string;

  porcentajeDirectivos: number;
  porcentajeAdministrativos: number;
  porcentajeDocentes: number;

  porcentajeDirectivosHombres: number;
  porcentajeDirectivosMujeres: number;

  porcentajeAdministrativosHombres: number;
  porcentajeAdministrativosMujeres: number;

  porcentajeDocentesHombres: number;
  porcentajeDocentesMujeres: number;

  porcentajeDocentesTiempoCompleto: number;
  porcentajeDocentesAsignatura: number;
  porcentajeDocentesHora: number;
}
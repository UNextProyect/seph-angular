/*
 * Respuesta del backend con la información
 * guardada del reporte de personal.
 */
export interface ReportePersonalResponse {
  id: number;
  idMapInstitucionPeriodo: number;

  intTotalGeneral: number;

  intTotalDirectivos: number;
  intTotalDirectivosHombres: number;
  intTotalDirectivosMujeres: number;

  intTotalAdministrativos: number;
  intTotalAdministrativosHombres: number;
  intTotalAdministrativosMujeres: number;

  intTotalDocentes: number;
  intTotalDocentesHombres: number;
  intTotalDocentesMujeres: number;

  intTotalDocentesTiempoCompleto: number;
  intTotalDocentesAsignatura: number;
  intTotalDocentesHora: number;

  idNivelAcademico: number;

  dateTimeFechaRegistro: string;
  idUsuarioRegistro: string;
  bitActivo: boolean;
}
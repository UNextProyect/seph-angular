/*
 * Datos enviados al backend para registrar
 * el reporte de personal del periodo activo.
 */
export interface CreateReportePersonalRequest {
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

  idUsuarioRegistro: string;
}
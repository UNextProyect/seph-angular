/*
 * Datos enviados al backend para actualizar
 * el reporte de matrícula del periodo activo.
 */
export interface UpdateReporteMatriculaRequest {
  idMapInstitucionPeriodo: number;

  intTotal: number;
  intTotalHombres: number;
  intTotalMujeres: number;

  intTsu: number;
  intLicenciatura: number;
  intPostgrado: number;

  decimalTazaDesercion: number;
  decimalTazaReprobacion: number;
  decimalTazaEficienciaTerminal: number;
}
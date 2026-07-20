/*
 * Datos enviados al backend para registrar
 * el reporte de matrícula del periodo activo.
 */
export interface CreateReporteMatriculaRequest {
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

  idUsuarioRegistro: string;
}
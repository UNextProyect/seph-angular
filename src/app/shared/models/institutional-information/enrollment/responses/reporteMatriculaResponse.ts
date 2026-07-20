/*
 * Respuesta del backend con la información
 * guardada del reporte de matrícula.
 */
export interface ReporteMatriculaResponse {
  id: number;
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
  dateTimeFechaRegistro: string;
  idUsuarioRegistro: string;
  bitActivo: boolean;
}
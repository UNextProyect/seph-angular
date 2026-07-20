/*
 * Datos enviados al backend para registrar
 * el reporte de infraestructura del periodo activo.
 */
export interface CreateReporteInfraestructuraRequest {
  idMapInstitucionPeriodo: number;

  intTotalAulas: number;

  intTotalLaboratorios: number;

  intTotalTalleres: number;

  bitBiblioteca: boolean;

  intTotalBibliotecas: number;

  intTotalComputo: number;

  idInternet: number;

  idDiscapacitado: number;

  idUsuarioRegistro: string;
}
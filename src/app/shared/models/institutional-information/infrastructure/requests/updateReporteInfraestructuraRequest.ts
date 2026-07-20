/*
 * Datos enviados al backend para actualizar
 * el reporte de infraestructura del periodo activo.
 */
export interface UpdateReporteInfraestructuraRequest {
  idMapInstitucionPeriodo: number;

  intTotalAulas: number;

  intTotalLaboratorios: number;

  intTotalTalleres: number;

  bitBiblioteca: boolean;

  intTotalBibliotecas: number;

  intTotalComputo: number;

  idInternet: number;

  idDiscapacitado: number;
}
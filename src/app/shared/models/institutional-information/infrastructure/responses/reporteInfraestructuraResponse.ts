/*
 * Respuesta del backend con la información
 * guardada del reporte de infraestructura.
 */
export interface ReporteInfraestructuraResponse {
  id: number;

  idMapInstitucionPeriodo: number;

  intTotalAulas: number;

  intTotalLaboratorios: number;

  intTotalTalleres: number;

  bitBiblioteca: boolean;

  intTotalBibliotecas: number;

  intTotalComputo: number;

  idInternet: number;

  idDiscapacitado: number;

  dateTimeFechaRegistro: string;

  idUsuarioRegistro: string;

  bitActivo: boolean;
}
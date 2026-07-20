/*
 * Respuesta del backend con las estadísticas
 * calculadas del reporte de infraestructura.
 */
export interface ReporteInfraestructuraEstadisticasResponse {
  periodo: string;

  totalAulas: number;

  totalLaboratorios: number;

  totalTalleres: number;

  cuentaConBiblioteca: boolean;

  totalBibliotecas: number;

  totalEquiposComputo: number;

  accesoInternet: string;

  instalacionesDiscapacidad: string;
}
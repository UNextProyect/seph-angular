/*
 * Respuesta del backend con el comparativo
 * entre el periodo actual y el anterior.
 */
export interface ReporteInfraestructuraComparativoResponse {
  indicador: string;

  valorActual: number;

  valorAnterior: number | null;

  diferencia: number;

  porcentaje: number;

  estado: string;
}
/*
 * Respuesta del backend con el comparativo
 * entre el periodo actual y el anterior.
 */
export interface ReporteInfraestructuraComparativoResponse {
  indicador: string;

  periodoActual: string;
  valorActual: number;

  periodoAnterior: string | null;
  valorAnterior: number | null;

  diferencia: number;
  porcentaje: number;
  estado: string;
}
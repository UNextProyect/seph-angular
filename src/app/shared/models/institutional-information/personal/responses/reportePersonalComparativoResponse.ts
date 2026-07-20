/*
 * Respuesta del backend con el comparativo
 * entre el periodo actual y el anterior.
 */
export interface ReportePersonalComparativoResponse {
  periodoActual: string;
  totalPersonalActual: number;

  periodoAnterior: string | null;
  totalPersonalAnterior: number | null;

  diferencia: number;
  porcentaje: number;
  estado: string;
}
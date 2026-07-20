/*
 * Respuesta del backend con el comparativo
 * entre el periodo actual y el anterior.
 */
export interface ReporteMatriculaComparativoResponse {
  periodoActual: string;
  matriculaActual: number;
  periodoAnterior: string | null;
  matriculaAnterior: number | null;
  diferencia: number;
  porcentaje: number;
  estado: string;
} 
/* Detalle completo de un empleado (datos básicos + académicos).
Se usa para poblar el formulario de Información Personal
al retomar un registro incompleto (Atrás / Continuar). */

export interface EmpleadoDetailResponse {
  id: number;
  strNombre: string;
  strApellidoPat: string;
  strApellidoMat: string;
  strCurp: string;
  idSexo: number;
  strSNII: string | null;
  idsPerfilAcademico: number[];
  bitDatosAcademicosCompletos: boolean;
}

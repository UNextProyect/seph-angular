/* Fila del concentrado de registros de personal.
Combina la información del empleado con su historial
de contrato y los textos de los catálogos ya resueltos.
Los campos del contrato llegan null cuando el registro
quedó incompleto (sin historial de contrato). */

export interface RegistroPersonalResponse {
  idEmpleado: number;
  strNombre: string;
  strApellidoPat: string;
  strApellidoMat: string;
  strCurp: string;
  strSexo: string;
  dateTimeFechaRegistro: string;
  bitActivo: boolean;
  bitDatosAcademicosCompletos: boolean;
  bitContratoCompleto: boolean;
  strSNII: string | null;
  perfilesAcademicos: string[];
  strInstitucion: string | null;
  strTipoPersonal: string | null;
  strTipoContrato: string | null;
  strArea: string | null;
  dateFechaIngreso: string | null;
}

/* Modelo utilizado para actualizar los datos básicos
(Nombre, apellidos, CURP, sexo) de un empleado ya registrado.
Se usa al retomar un registro incompleto. */

export interface UpdateEmpleadoBasicoRequest {
  strNombre: string;
  strApellidoPat: string;
  strApellidoMat: string;
  strCurp: string;
  idSexo: number;
}

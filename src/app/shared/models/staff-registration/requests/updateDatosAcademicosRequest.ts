/* Modelo utilizado para enviar los datos académicos
(SNI/SNII y perfiles académicos) de un empleado
ya registrado. Se utiliza en el paso 2 de
Información Personal, dentro de Registro Personal. */

export interface UpdateDatosAcademicosRequest {
  strSNII: string | null;
  idsPerfilAcademico: number[];
}

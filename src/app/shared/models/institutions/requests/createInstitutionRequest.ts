/* Modelo utilizado para enviar los datos de una institución
nueva al backend. Solo strNombre e idMunicipio son obligatorios
(ver CreateInstitucionCommandValidator en el backend). */

export interface CreateInstitutionRequest {
  strNombre: string;
  strSiglas: string | null;
  strCct: string | null;
  strDireccion: string | null;
  dateFechaCreacion: string | null;
  strDecretoCreacion: string | null;
  strSitioWeb: string | null;
  strCorreoInstitucional: string | null;
  strTelefonoInstitucional: string | null;
  idMunicipio: number;
}

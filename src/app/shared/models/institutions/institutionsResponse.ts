/* Institución registrada, tal como la devuelve el backend
(InstitucionDto). Se usa en el módulo de instituciones del
panel administrativo y donde se necesite resolver la
institución de un usuario. */
export interface InstitutionsResponse {
    id: number;
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
    bitActivo: boolean;
}
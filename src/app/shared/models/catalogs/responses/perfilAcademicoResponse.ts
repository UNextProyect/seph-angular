/**
 * Modelo que representa un registro
 * del catálogo de perfiles académicos
 * (programas educativos).
 */

export interface PerfilAcademicoResponse {
  id: number;  /** Identificador único */
  strValor: string; /** Valor mostrado al usuario */
  strDescripcion: string;   /** Descripción interna */
}

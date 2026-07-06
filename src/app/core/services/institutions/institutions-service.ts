import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../../shared/models/apiResponse';

import { InstitutionsResponse } from '../../../shared/models/institutions/institutionsResponse';
import { CreateInstitutionRequest } from '../../../shared/models/institutions/requests/createInstitutionRequest';

const API_URL = 'https://localhost:7160/api/v1';

/* Servicio que se encarga de gestionar todas las operaciones
del módulo de instituciones. */
@Injectable({
  providedIn: 'root'
})
export class InstitutionsService {

  /* Cliente HTTP para consumir endpoints. */
  private readonly http = inject(HttpClient);

  /* Obtiene todas las instituciones registradas.
    Endpoint: GET /Institucion/get-instituciones
    @returns Lista de instituciones. */
  getInstitutions() {
    return this.http.get<ApiResponse<InstitutionsResponse[]>>(
      `${API_URL}/Institucion/get-instituciones`
    );
  }

  /* Registra una nueva institución. Solo un SuperAdmin puede hacerlo.
    Endpoint: POST /Institucion/create-institucion */
  createInstitution(request: CreateInstitutionRequest) {
    return this.http.post<ApiResponse<InstitutionsResponse>>(
      `${API_URL}/Institucion/create-institucion`,
      request
    );
  }

  /* Obtiene el detalle de una institución (para poblar el
    formulario de edición).
    Endpoint: GET /Institucion/{id} */
  getInstitutionById(id: number) {
    return this.http.get<ApiResponse<InstitutionsResponse>>(
      `${API_URL}/Institucion/${id}`
    );
  }

  /* Actualiza una institución existente. Solo un SuperAdmin puede hacerlo.
    Endpoint: PUT /Institucion/{id} */
  updateInstitution(id: number, request: CreateInstitutionRequest) {
    return this.http.put<ApiResponse<InstitutionsResponse>>(
      `${API_URL}/Institucion/${id}`,
      request
    );
  }

  /* Desactiva una institución (no se elimina el registro, ya que
    puede tener empleados y contratos ligados). Solo un SuperAdmin
    puede hacerlo.
    Endpoint: PUT /Institucion/{id}/desactivar */
  deactivateInstitution(id: number) {
    return this.http.put<ApiResponse<string>>(
      `${API_URL}/Institucion/${id}/desactivar`,
      {}
    );
  }

  /* Reactiva una institución previamente desactivada. Solo un
    SuperAdmin puede hacerlo.
    Endpoint: PUT /Institucion/{id}/reactivar */
  reactivateInstitution(id: number) {
    return this.http.put<ApiResponse<string>>(
      `${API_URL}/Institucion/${id}/reactivar`,
      {}
    );
  }

}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../shared/models/apiResponse';

import { SexResponse } from '../../../shared/models/catalogs/responses/sexResponse';
import { PerfilAcademicoResponse } from '../../../shared/models/catalogs/responses/perfilAcademicoResponse';
import { MunicipioResponse } from '../../../shared/models/catalogs/responses/municipioResponse';
import { NivelAcademicoResponse } from '../../../shared/models/catalogs/responses/nivelAcademicoResponse';
import { InternetResponse } from '../../../shared/models/catalogs/responses/internetResponse';
import { DiscapacitadoResponse } from '../../../shared/models/catalogs/responses/discapacitadoResponse';
import { PeriodResponse } from '../../../shared/models/catalogs/responses/periodResponse';

import { CreatePeriodRequest } from '../../../shared/models/catalogs/requests/createPeriodRequest';
import { UpdatePeriodRequest } from '../../../shared/models/catalogs/requests/updatePeriodRequest';
import { ChangePeriodStatusRequest } from '../../../shared/models/catalogs/requests/changePeriodStatusRequest';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly http = inject(HttpClient);

  /* URL base general de la API. */
  private readonly apiBaseUrl =
    'https://localhost:7160/api/v1';

  /* URL para los catálogos agrupados en CatalogosController. */
  private readonly catalogosUrl =
    `${this.apiBaseUrl}/Catalogos`;

  getSexes(): Observable<ApiResponse<SexResponse[]>> {
    return this.http.get<ApiResponse<SexResponse[]>>(
      `${this.catalogosUrl}/sexos`
    );
  }

  getTiposPersonal(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.catalogosUrl}/tipos-personal`
    );
  }

  getTiposContrato(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.catalogosUrl}/tipos-contrato`
    );
  }

  getAreas(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.catalogosUrl}/areas`
    );
  }

  getPerfilesAcademicos(): Observable<ApiResponse<PerfilAcademicoResponse[]>> {
    return this.http.get<ApiResponse<PerfilAcademicoResponse[]>>(
      `${this.catalogosUrl}/perfiles-academicos`
    );
  }

  getMunicipios(): Observable<ApiResponse<MunicipioResponse[]>> {
    return this.http.get<ApiResponse<MunicipioResponse[]>>(
      `${this.catalogosUrl}/municipios`
    );
  }

  getNivelesAcademicos(): Observable<ApiResponse<NivelAcademicoResponse[]>> {
    return this.http.get<ApiResponse<NivelAcademicoResponse[]>>(
      `${this.catalogosUrl}/niveles-academicos`
    );
  }

  getInternet(): Observable<ApiResponse<InternetResponse[]>> {
    return this.http.get<ApiResponse<InternetResponse[]>>(
      `${this.catalogosUrl}/internet`
    );
  }

  getDiscapacitados(): Observable<ApiResponse<DiscapacitadoResponse[]>> {
    return this.http.get<ApiResponse<DiscapacitadoResponse[]>>(
      `${this.catalogosUrl}/discapacitados`
    );
  }

  /* Obtiene los periodos desde CatPeriodoController. */
  getPeriods(): Observable<ApiResponse<PeriodResponse[]>> {
    return this.http.get<ApiResponse<PeriodResponse[]>>(
      `${this.apiBaseUrl}/CatPeriodo`
    );
  }

  /* Registra un nuevo periodo. */
  createPeriod(
    request: CreatePeriodRequest
  ): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(
      `${this.apiBaseUrl}/CatPeriodo/create-periodo`,
      request
    );
  }

  /* Actualiza un periodo existente. */
  updatePeriod(
    id: number,
    request: UpdatePeriodRequest
  ): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiBaseUrl}/CatPeriodo/${id}`,
      request
    );
  }

  /* Activa o desactiva un periodo. */
  changePeriodStatus(
    id: number,
    request: ChangePeriodStatusRequest
  ): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(
      `${this.apiBaseUrl}/CatPeriodo/${id}/status`,
      request
    );
  }
}
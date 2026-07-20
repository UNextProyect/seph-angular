import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../shared/models/apiResponse';
import { SexResponse } from '../../../shared/models/catalogs/responses/sexResponse';
import { PerfilAcademicoResponse } from '../../../shared/models/catalogs/responses/perfilAcademicoResponse';
import { MunicipioResponse } from '../../../shared/models/catalogs/responses/municipioResponse';
import { NivelAcademicoResponse } from '../../../shared/models/catalogs/responses/nivelAcademicoResponse';
import { InternetResponse }from '../../../shared/models/catalogs/responses/internetResponse';
import { DiscapacitadoResponse }from '../../../shared/models/catalogs/responses/discapacitadoResponse';
@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7160/api/v1/Catalogos';

  getSexes(): Observable<ApiResponse<SexResponse[]>> {
    return this.http.get<ApiResponse<SexResponse[]>>(
      `${this.apiUrl}/sexos`
    );
  }

  getTiposPersonal(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/tipos-personal`
    );
  }

  getTiposContrato(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/tipos-contrato`
    );
  }

  getAreas(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/areas`
    );
  }

  getPerfilesAcademicos(): Observable<ApiResponse<PerfilAcademicoResponse[]>> {
    return this.http.get<ApiResponse<PerfilAcademicoResponse[]>>(
      `${this.apiUrl}/perfiles-academicos`
    );
  }

  getMunicipios(): Observable<ApiResponse<MunicipioResponse[]>> {
    return this.http.get<ApiResponse<MunicipioResponse[]>>(
      `${this.apiUrl}/municipios`
    );
  }

  getNivelesAcademicos(): Observable<ApiResponse<NivelAcademicoResponse[]>> {
  return this.http.get<ApiResponse<NivelAcademicoResponse[]>>(
    `${this.apiUrl}/niveles-academicos`
  );
}
getInternet(): Observable<ApiResponse<InternetResponse[]>> {
  return this.http.get<ApiResponse<InternetResponse[]>>(
    `${this.apiUrl}/internet`
  );
}

getDiscapacitados(): Observable<ApiResponse<DiscapacitadoResponse[]>> {
  return this.http.get<ApiResponse<DiscapacitadoResponse[]>>(
    `${this.apiUrl}/discapacitados`
  );
}

}
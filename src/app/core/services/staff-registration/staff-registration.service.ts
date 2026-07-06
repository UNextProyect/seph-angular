import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResponse } from '../../../shared/models/apiResponse';

import { CreateEmployeeRequest }
from '../../../shared/models/staff-registration/requests/createEmployeeRequest';

import { EmployeeResponse }
from '../../../shared/models/staff-registration/responses/employeeResponse';

import { CreateHistorialContratoRequest }
from '../../../shared/models/staff-registration/requests/createHistorialContratoRequest';
import { RegistroPersonalResponse }
from '../../../shared/models/staff-registration/responses/registroPersonalResponse';
import { UpdateDatosAcademicosRequest }
from '../../../shared/models/staff-registration/requests/updateDatosAcademicosRequest';
import { UpdateEmpleadoBasicoRequest }
from '../../../shared/models/staff-registration/requests/updateEmpleadoBasicoRequest';
import { EmpleadoDetailResponse }
from '../../../shared/models/staff-registration/responses/empleadoDetailResponse';
/*URL base del backend. *
 * Se reutiliza para todas las peticiones del módulo. */
const API_URL = 'https://localhost:7160/api/v1';


/* Servicio encargado de gestionar
 operaciones del módulo Registro Personal. */
@Injectable({
  providedIn: 'root'
})
export class StaffRegistrationService {

/* Cliente HTTP para consumir endpoints. */
  private http = inject(HttpClient);

  /* Registra un empleado. *
    Endpoint:  POST /empleado/create-empleado
   * @param request Información capturada del formulario.
   * @returns Identificador del registro creado. */
  createEmployee(
  request: CreateEmployeeRequest
) {

  return this.http.post<ApiResponse<EmployeeResponse>>(
    `${API_URL}/empleado/create-empleado`,
    request
  );

}
createHistorialContrato(
  request: CreateHistorialContratoRequest
) {
  return this.http.post<ApiResponse<any>>(
    `${API_URL}/HistorialContrato/create-historial-contrato`,
    request
  );
}

/* Obtiene el concentrado de registros de personal
  capturados por el usuario autenticado.
  Endpoint: GET /empleado/get-registros
  @returns Lista de registros (empleado + historial de contrato). */
getRegistros() {
  return this.http.get<ApiResponse<RegistroPersonalResponse[]>>(
    `${API_URL}/empleado/get-registros`
  );
}

/* Actualiza el SNI/SNII y los perfiles académicos de un empleado
  ya registrado (segunda pantalla de Información Personal).
  Endpoint: PUT /empleado/{id}/datos-academicos */
updateDatosAcademicos(
  employeeId: number,
  request: UpdateDatosAcademicosRequest
) {
  return this.http.put<ApiResponse<string>>(
    `${API_URL}/empleado/${employeeId}/datos-academicos`,
    request
  );
}

/* Obtiene el detalle completo (básico + académico) de un empleado.
  Se usa para poblar el formulario al retomar un registro incompleto.
  Endpoint: GET /empleado/{id} */
getEmpleadoById(employeeId: number) {
  return this.http.get<ApiResponse<EmpleadoDetailResponse>>(
    `${API_URL}/empleado/${employeeId}`
  );
}

/* Actualiza los datos básicos de un empleado ya registrado.
  Se usa al retomar un registro incompleto (pantalla 1).
  Endpoint: PUT /empleado/{id} */
updateEmpleadoBasico(
  employeeId: number,
  request: UpdateEmpleadoBasicoRequest
) {
  return this.http.put<ApiResponse<string>>(
    `${API_URL}/empleado/${employeeId}`,
    request
  );
}

}

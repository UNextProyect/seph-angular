import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { ApiResponse } from '../../../shared/models/apiResponse';
import { AuthResponse } from '../../../shared/models/auth/responses/authResponse';
import { LoginRequest } from '../../../shared/models/auth/requests/loginRequest';

//const API_URL = 'https://api-seph.papus.online/api/v1';
const API_URL = 'https://localhost:7160/api/v1';

/**
 * Decodifica el payload de un JWT sin validar la firma.
 * Retorna null si el token está corrupto o mal formado.
 */
function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<AuthResponse['user'] | null>(null);
  isAuthenticated = signal<boolean>(false);

  private readonly deviceId = this.getOrCreateDeviceId();

  /**
   * Al iniciar el servicio intenta restaurar la sesión
   * utilizando la información almacenada en localStorage.
   */
  constructor() {
    this.restoreSession();
  }

  /**
   * Obtiene el identificador único del dispositivo con localStorage.
   * Si no existe en localStorage, genera uno nuevo y lo almacena.
   * Se utiliza para identificar el dispositivo en las peticiones al API.
   */
  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  /**
   * Genera los encabezados HTTP necesarios para las peticiones
   * de autenticación incluyendo el id del dispositivo.
   */
  private get headers() {
    return new HttpHeaders({ 'X-Device-Id': this.deviceId });
  }

  /**
   * Recupera la sesión guardada en localStorage.
   * Verifica la existencia del token y del usuario.
   * No confirma la sesión como autenticada hasta saber que el
   * access token sigue vigente o que el refresh fue exitoso.
   */
  private restoreSession() {
    const token = localStorage.getItem('accessToken');
    const userJson = localStorage.getItem('currentUser');

    if (!token || !userJson) {
      return;
    }

    const payload = decodeJwtPayload<{ exp: number }>(token);

    if (!payload) {
      this.clearSession();
      return;
    }

    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      // El access token ya venció (p. ej. la pestaña quedó abierta
      // más de 15 minutos). Se refresca aquí mismo en lugar de esperar
      // a que la primera petición protegida falle con 401, para que
      // la sesión quede lista antes de que el usuario haga algo.
      // No marcamos isAuthenticated hasta confirmar que el refresh
      // funcionó, para evitar dejar pasar una sesión ya vencida.
      this.refreshToken().subscribe({
        next: (response) => {
          if (response.data) {
            this.saveSession(response.data);
          } else {
            this.forceLogout();
          }
        },
        error: () => this.forceLogout()
      });
      return;
    }

    try {
      const user = JSON.parse(userJson);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    } catch {
      this.clearSession();
    }
  }

  /**
   * Envía las credenciales al servidor para iniciar sesión.
   *
   * @param request Datos de acceso del usuario como usuario y contraseña.
   */
  login(request: LoginRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${API_URL}/auth/login`,
      request,
      { headers: this.headers }
    );
  }

  /**
   * Solicita un nuevo access token utilizando el refresh token almacenado en nuestra db.
   */
  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    return this.http.post<ApiResponse<AuthResponse>>(
      `${API_URL}/auth/refresh-token`,
      { refreshToken },
      { headers: this.headers }
    );
  }

  /**
   * Cierra la sesión actual.
   * Notifica al servidor para invalidar el refresh token,
   * elimina los datos locales y redirige al login.
   */
  logout() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.forceLogout();
      return;
    }

    this.http.post<ApiResponse<boolean>>(
      `${API_URL}/auth/logout`,
      { refreshToken }
    ).subscribe({
      next: () => this.forceLogout(),
      error: () => this.forceLogout()
    });
  }

  /**
   * Limpia la sesión local y redirige al login,
   * sin intentar notificar al servidor.
   */
  forceLogout() {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Guarda la información de autenticación en localStorage
   * y actualiza el estado reactivo de la aplicación.
   *
   * @param auth Información devuelta por el servidor al autenticarse.
   */
  saveSession(auth: AuthResponse) {
    localStorage.setItem('accessToken', auth.accessToken);
    localStorage.setItem('refreshToken', auth.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(auth.user));

    this.currentUser.set(auth.user);
    this.isAuthenticated.set(true);
  }

  /**
   * Elimina toda la información de sesión almacenada localmente
   * y reinicia el estado de autenticación.
   */
  private clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Obtiene el access token almacenado localmente.
   *
   * @returns Token JWT o null si no existe.
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * @param fullName Nombre completo del usuario.
   * @param email Correo electrónico.
   * @param password Contraseña.
   * @returns Observable con el resultado del registro.
   */
  register(fullName: string, email: string, password: string) {
    return this.http.post<ApiResponse<string>>(
      `${API_URL}/auth/register`,
      { fullName, email, password }
    );
  }

  /**
   * Confirma la cuenta del usuario mediante el código enviado por correo.
   *
   * @param email Correo del usuario.
   * @param code Código de verificación.
   * @returns Observable con el resultado de la validación.
   */
  verifyEmail(email: string, code: string) {
    return this.http.post<ApiResponse<string>>(
      `${API_URL}/auth/verify-email`,
      { email, code }
    );
  }

  /**
   * Solicita el reenvío del código de verificación al correo indicado.
   *
   * @param email Correo del usuario.
   * @returns Observable con el resultado de la operación.
   */
  resendVerificationCode(email: string) {
    return this.http.post<ApiResponse<string>>(
      `${API_URL}/auth/resend-verification`,
      { email }
    );
  }
}

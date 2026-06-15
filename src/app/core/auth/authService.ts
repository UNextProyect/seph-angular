import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiResponse } from '../../shared/models/apiResponse';
import { AuthResponse } from '../../shared/models/auth/responses/authResponse';
import { LoginRequest } from '../../shared/models/auth/requests/loginRequest';

//const API_URL = 'https://api-seph.papus.online/api/v1';
const API_URL = 'https://localhost:7160/api/v1';

function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

const DEVICE_ID = getOrCreateDeviceId();

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<AuthResponse['user'] | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.restoreSession();
  }

  private get headers() {
    return new HttpHeaders({ 'X-Device-Id': DEVICE_ID });
  }

  private restoreSession() {
    const token = localStorage.getItem('accessToken');
    const userJson = localStorage.getItem('currentUser');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        this.clearSession();
      }
    }
  }

  login(request: LoginRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${API_URL}/auth/login`,
      request,
      { headers: this.headers }
    );
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http.post<ApiResponse<AuthResponse>>(
      `${API_URL}/auth/refresh-token`,
      { refreshToken },
      { headers: this.headers }
    );
  }

  saveSession(auth: AuthResponse) {
    localStorage.setItem('accessToken', auth.accessToken);
    localStorage.setItem('refreshToken', auth.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(auth.user));
    this.currentUser.set(auth.user);
    this.isAuthenticated.set(true);
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  private clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}
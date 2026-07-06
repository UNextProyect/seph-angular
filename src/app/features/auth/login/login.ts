import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/authService';
import { LoginRequest } from '../../../shared/models/auth/requests/loginRequest';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  form: LoginRequest = { email: '', password: '' };
  loading = signal(false);
  error = signal<string | null>(null);

  login() {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form).subscribe({
      next: (response) => {
        if (response.data) {
          this.authService.saveSession(response.data);
          this.router.navigate(['/home']);
        } else {
          this.error.set(response.message ?? 'Error al iniciar sesión');
        }
        this.loading.set(false);
      },
     error: (err) => {
        this.error.set(err.error?.message ?? 'Error de conexión con el servidor');
        this.loading.set(false);
}
    });
  }
  mostrarPassword = false;

togglePassword(): void {
  this.mostrarPassword = !this.mostrarPassword;
}
}
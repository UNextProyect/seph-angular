import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth/authService';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);

  readonly isSuperAdmin = computed(() =>
  this.authService.currentUser()?.roles?.includes('SuperAdmin') ?? false
);

  readonly isAuthenticated = this.authService.isAuthenticated;

  logout() : void {
    this.authService.logout();
  }
}

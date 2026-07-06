import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth/authService';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);

  readonly isSuperAdmin = computed(() =>
    this.authService.currentUser()?.roles?.includes('SuperAdmin') ?? false
  );

  readonly isAuthenticated = this.authService.isAuthenticated;

  logout(): void {
    this.authService.logout();
  }
}
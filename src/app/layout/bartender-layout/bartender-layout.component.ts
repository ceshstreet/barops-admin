import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-bartender-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './bartender-layout.component.html',
  styleUrl: './bartender-layout.component.scss',
})
export class BartenderLayoutComponent {
  auth = inject(AuthService);

  get userName(): string {
    const u = this.auth.user();
    return u ? `${u.name} ${u.lastName}` : '';
  }

  get initials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    return ((u.name?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase();
  }

  logout(): void { this.auth.logout(); }
}

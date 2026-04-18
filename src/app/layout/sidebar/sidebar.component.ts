import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private auth = inject(AuthService);

  user = this.auth.user;

  get initials(): string {
    const u = this.user();
    return ((u?.name?.[0] ?? '') + (u?.lastName?.[0] ?? '')).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Package } from '../../models/package.model';
import { PackageService } from '../../services/package.service';
import { DrinkTheme } from '../../../drink-themes/models/drink-theme.model';
import { DrinkThemeService } from '../../../drink-themes/services/drink-theme.service';

@Component({
  selector: 'app-package-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './packages-list.component.html',
  styleUrl: './packages-list.component.scss',
})
export class PackageListComponent implements OnInit {
  packages: Package[] = [];
  allThemes: DrinkTheme[] = [];
  searchTerm = '';
  loading = true;

  constructor(
    private router: Router,
    private packageService: PackageService,
    private themeService: DrinkThemeService,
  ) {}

  ngOnInit(): void {
    this.packageService.getAll().subscribe({
      next: (pkgs) => { this.packages = pkgs; this.loading = false; },
      error: (err) => { console.error('Error loading packages:', err); this.loading = false; },
    });

    this.themeService.getAll().subscribe({
      next: (themes) => this.allThemes = themes,
      error: (err) => console.error('Error loading themes:', err),
    });
  }

  get filtered(): Package[] {
    return this.packages.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get activeCount(): number {
    return this.packages.filter(p => p.status === 'active').length;
  }

  get minPrice(): number {
    if (this.packages.length === 0) return 0;
    return Math.min(...this.packages.map(p => p.basePrice));
  }

  get pricePerGuestRange(): string {
    if (this.packages.length === 0) return '$0';
    const min = Math.min(...this.packages.map(p => p.pricePerGuest));
    const max = Math.max(...this.packages.map(p => p.pricePerGuest));
    return `$${min}–$${max}`;
  }

  getThemesForPackage(pkg: Package): DrinkTheme[] {
    return (pkg.themeIds || [])
      .map(id => this.allThemes.find(t => t._id === id))
      .filter((t): t is DrinkTheme => !!t);
  }

  calcMinPrice(pkg: Package): number {
    return pkg.basePrice + (pkg.minGuests * pkg.pricePerGuest);
  }

  viewPackage(id: string): void { this.router.navigate(['/packages', id]); }
  createPackage(): void { this.router.navigate(['/packages/new']); }
}
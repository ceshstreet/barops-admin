import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  THEME_STYLES, TARGET_EVENTS, THEME_COLORS,
} from '../../models/drink-theme.model';
import { MOCK_THEMES } from '../../models/drink-theme.mock';
import { Drink, DRINK_TYPES } from '../../../drinks/models/drink.model';
import { DrinkService } from '../../../drinks/services/drink.service';

@Component({
  selector: 'app-drink-theme-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drink-theme-form.component.html',
  styleUrl: './drink-theme-form.component.scss',
})
export class DrinkThemeFormComponent implements OnInit {
  isEdit = false;
  themeId: string | null = null;

  themeName = '';
  themeDescription = '';
  themeStyle = '';
  themeTargetEvent = '';
  themeColor = '#a78bfa';
  selectedIds: string[] = [];

  styles = THEME_STYLES;
  targetEvents = TARGET_EVENTS;
  colors = THEME_COLORS;
  drinkTypes = DRINK_TYPES;

  allDrinks: Drink[] = [];
  filteredItems: Drink[] = [];
  activeType: string = 'cocktail';
  searchTerm = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private drinkService: DrinkService,
  ) {}

  ngOnInit(): void {
    // Load drinks from API
    this.drinkService.getAll().subscribe({
      next: (drinks) => {
        this.allDrinks = drinks.filter(d => d.status === 'active');
        this.applyFilter();
      },
      error: (err) => console.error('Error loading drinks:', err),
    });

    this.themeId = this.route.snapshot.paramMap.get('id');
    if (this.themeId) {
      this.isEdit = true;
      // TODO: Replace with theme service
      const found = MOCK_THEMES.find(t => t._id === this.themeId);
      if (found) {
        this.themeName = found.name;
        this.themeDescription = found.description;
        this.themeStyle = found.style;
        this.themeTargetEvent = found.targetEvent;
        this.themeColor = found.color;
        this.selectedIds = [...found.drinkIds];
      }
    }
  }

  switchType(type: string): void {
    this.activeType = type;
    this.searchTerm = '';
    this.applyFilter();
  }

  getTypeCount(type: string): { total: number; selected: number } {
    const items = this.allDrinks.filter(d => d.type === type);
    return {
      total: items.length,
      selected: items.filter(d => this.selectedIds.includes(d._id)).length,
    };
  }

  applyFilter(): void {
    this.filteredItems = this.allDrinks.filter(d =>
      d.type === this.activeType &&
      d.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleItem(id: string): void {
    this.selectedIds = this.isSelected(id)
      ? this.selectedIds.filter(x => x !== id)
      : [...this.selectedIds, id];
  }

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id);
  }

  removeSelected(id: string): void {
    this.selectedIds = this.selectedIds.filter(x => x !== id);
  }

  getDrinkById(id: string): Drink | undefined {
    return this.allDrinks.find(d => d._id === id);
  }

  get selectedByType(): { type: string; label: string; icon: string; color: string; items: Drink[] }[] {
    return this.drinkTypes
      .map(dt => ({
        type: dt.value,
        label: dt.label,
        icon: dt.icon,
        color: dt.color,
        items: this.selectedIds
          .map(id => this.getDrinkById(id))
          .filter((d): d is Drink => !!d && d.type === dt.value),
      }))
      .filter(g => g.items.length > 0);
  }

  get totalSelected(): number {
    return this.selectedIds.length;
  }

  selectColor(color: string): void {
    this.themeColor = color;
  }

  saveTheme(): void {
    const payload = {
      name: this.themeName,
      description: this.themeDescription,
      style: this.themeStyle,
      targetEvent: this.themeTargetEvent,
      color: this.themeColor,
      drinkIds: this.selectedIds,
      status: true,
    };
    console.log('💾 Theme payload:', payload);
    // TODO: Replace with theme service
    alert(`Mock ${this.isEdit ? 'update' : 'create'}: ${payload.name}`);
    this.router.navigate(['/drink-themes']);
  }

  cancel(): void {
    this.router.navigate(['/drink-themes']);
  }
}
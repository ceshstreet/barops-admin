import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Drink {
  id: string;
  name: string;
  category: string;
  baseSpirit: string;
  glassware: string;
  garnish: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-drink-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drink-list.component.html',
  styleUrl: './drink-list.component.scss'
})
export class DrinkListComponent {
  constructor(private router: Router) {}

  drinks: Drink[] = [
    {
      id: 'DRK-001',
      name: 'Cuban Mojito',
      category: 'Classic Cocktail',
      baseSpirit: 'White Rum',
      glassware: 'Highball',
      garnish: 'Mint + Lime Wheel',
      status: 'active'
    },
    {
      id: 'DRK-002',
      name: 'Piña Colada',
      category: 'Tropical',
      baseSpirit: 'Rum',
      glassware: 'Hurricane Glass',
      garnish: 'Pineapple Slice',
      status: 'active'
    },
    {
      id: 'DRK-003',
      name: 'Margarita',
      category: 'Spirit-Based',
      baseSpirit: 'Tequila',
      glassware: 'Coupe / Margarita Glass',
      garnish: 'Lime Wheel + Salt Rim',
      status: 'active'
    },
    {
      id: 'DRK-004',
      name: 'Old Fashioned',
      category: 'Classic Cocktail',
      baseSpirit: 'Whiskey',
      glassware: 'Rocks Glass',
      garnish: 'Orange Peel',
      status: 'active'
    },
    {
      id: 'DRK-005',
      name: 'Grinch Punch',
      category: 'Holiday',
      baseSpirit: 'Vodka',
      glassware: 'Punch Glass',
      garnish: 'Cherry',
      status: 'inactive'
    }
  ];

  createDrink() {
    this.router.navigate(['/drinks/new']);
  }

  openDrink(drink: Drink) {
    this.router.navigate(['/drinks', drink.id]);
  }

  getStatusClass(status: string): string {
    if (status === 'active') return 'active';
    return 'inactive';
  }
}
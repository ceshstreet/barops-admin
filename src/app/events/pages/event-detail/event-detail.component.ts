import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent {
  eventId: string | null = null;

  event = {
    id: 'EVT-1021',
    client: 'Ana M.',
    eventName: 'Wedding - Hacienda Los Pinos',
    eventType: 'Wedding',
    eventDate: '2026-02-07',
    startTime: '6:00 PM',
    endTime: '11:00 PM',
    location: 'Hacienda Los Pinos',
    guests: '100+',
    package: 'Ultimate',
    drinkTheme: 'Classic',
    bartender: 'Maria P.',
    barType: 'Ultimate Bar',
    budgetRange: '$1,200+',
    status: 'scheduled',
    notes: 'Customer requested premium signature cocktails and full bar setup.',
    drinks: [
      {
        name: 'Cuban Mojito',
        ingredients: [
          'White Rum',
          'Mint',
          'Lime',
          'Sugar Syrup',
          'Soda Water',
          'Ice'
        ],
        preparation: 'Muddle mint and lime, add rum and sugar syrup, fill with ice, top with soda water, and stir gently.',
        garnish: 'Mint sprig + lime wheel'
      },
      {
        name: 'Piña Colada',
        ingredients: [
          'Rum',
          'Pineapple Juice',
          'Coconut Cream',
          'Ice'
        ],
        preparation: 'Blend rum, pineapple juice, coconut cream, and ice until smooth.',
        garnish: 'Pineapple slice'
      },
      {
        name: 'Margarita',
        ingredients: [
          'Tequila',
          'Triple Sec',
          'Lime Juice',
          'Ice',
          'Salt'
        ],
        preparation: 'Shake tequila, triple sec, lime juice, and ice, then strain into a prepared glass.',
        garnish: 'Lime wheel + salt rim'
      }
    ]
  };

  ingredientSummary: { name: string; quantity: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.eventId = this.route.snapshot.paramMap.get('id');
    this.buildIngredientSummary();
  }

  goBack() {
    this.router.navigate(['/events']);
  }

  editEvent() {
    alert(`Mock action: edit event ${this.eventId}`);
  }

  viewSummary() {
    this.router.navigate(['/events', this.eventId, 'summary']);
  }

  private buildIngredientSummary() {
    const ingredientMap = new Map<string, number>();

    this.event.drinks.forEach((drink) => {
      drink.ingredients.forEach((ingredient) => {
        const current = ingredientMap.get(ingredient) || 0;
        ingredientMap.set(ingredient, current + 1);
      });
    });

    this.ingredientSummary = Array.from(ingredientMap.entries()).map(
      ([name, quantity]) => ({
        name,
        quantity
      })
    );
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent {
  stats = [
    {
      label: 'Total Reservations',
      value: 18,
      helper: '+3 this week'
    },
    {
      label: 'Upcoming Events',
      value: 6,
      helper: 'Next 7 days'
    },
    {
      label: 'Active Clients',
      value: 14,
      helper: '3 VIP clients'
    },
    {
      label: 'Available Bartenders',
      value: 3,
      helper: '2 currently busy'
    }
  ];

  upcomingEvents = [
    {
      id: 'EVT-1021',
      eventName: 'Wedding - Hacienda Los Pinos',
      client: 'Ana M.',
      date: '2026-02-07',
      bartender: 'Maria P.',
      location: 'Hacienda Los Pinos',
      status: 'confirmed'
    },
    {
      id: 'EVT-1022',
      eventName: 'Corporate Event - Rooftop Centro',
      client: 'Inversiones XYZ',
      date: '2026-02-08',
      bartender: 'Pending assignment',
      location: 'Rooftop Centro',
      status: 'pending'
    },
    {
      id: 'EVT-1023',
      eventName: 'Private Party - Santa Tecla',
      client: 'Carlos R.',
      date: '2026-02-10',
      bartender: 'Sofia G.',
      location: 'Santa Tecla',
      status: 'confirmed'
    },
    {
      id: 'EVT-1024',
      eventName: 'Birthday - San Benito',
      client: 'Lucia V.',
      date: '2026-02-14',
      bartender: 'Jorge L.',
      location: 'San Benito',
      status: 'confirmed'
    }
  ];

  alerts = [
    {
      title: 'Bartender Assignment Needed',
      description: 'Corporate Event - Rooftop Centro still has no bartender assigned.',
      severity: 'warning'
    },
    {
      title: 'Low Inventory',
      description: 'Limes and rum are below recommended stock level.',
      severity: 'danger'
    },
    {
      title: 'Menu Review',
      description: 'One package is missing linked drinks in the operational setup.',
      severity: 'info'
    }
  ];

  quickActions = [
    {
      label: 'New Reservation',
      description: 'Create a new event booking',
      route: '/reservations/new'
    },
    {
      label: 'View Calendar',
      description: 'Check monthly reservations',
      route: '/reservations/calendar'
    },
    {
      label: 'New Client',
      description: 'Add a new customer profile',
      route: '/clients/new'
    },
    {
      label: 'New Drink',
      description: 'Create a new drink recipe',
      route: '/drinks/new'
    }
  ];

  catalogSummary = [
    { label: 'Packages', value: 3 },
    { label: 'Drink Themes', value: 5 },
    { label: 'Drinks', value: 5 },
    { label: 'Bar Types', value: 3 },
    { label: 'Bartenders', value: 4 },
    { label: 'Clients', value: 14 }
  ];

  bartenderWorkload = [
    {
      name: 'Maria P.',
      specialty: 'Classic Cocktails',
      status: 'available'
    },
    {
      name: 'Jorge L.',
      specialty: 'Tropical Drinks',
      status: 'busy'
    },
    {
      name: 'Sofia G.',
      specialty: 'Premium Service',
      status: 'available'
    }
  ];

  getStatusClass(status: string): string {
    if (status === 'confirmed') return 'confirmed';
    if (status === 'pending') return 'pending';
    if (status === 'available') return 'available';
    if (status === 'busy') return 'busy';
    return 'cancelled';
  }

  getAlertClass(severity: string): string {
    if (severity === 'warning') return 'warning';
    if (severity === 'danger') return 'danger';
    return 'info';
  }
}
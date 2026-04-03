import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

import { BartenderFormComponent } from './bartenders/pages/bartender-form/bartender-form.component';
import { BartenderListComponent } from './bartenders/pages/bartender-list/bartender-list.component';
import { BartenderDetailComponent } from './bartenders/pages/bartender-detail/bartender-detail.component';
import { BarTypeFormComponent } from './bar-types/pages/bar-type-form/bar-type-form.component';
import { BarTypeListComponent } from './bar-types/pages/bar-type-list/bar-type-list.component';

import { ClientFormComponent } from './clients/pages/client-form/client-form.component';
import { ClientListComponent } from './clients/pages/client-list/client-list.component';
import { ClientDetailComponent } from './clients/pages/client-detail/client-detail.component';

import { DashboardHomeComponent } from './dashboard/pages/dashboard-home/dashboard-home.component';

import { DrinkFormComponent } from './drinks/pages/drink-form/drink-form.component';
import { DrinkListComponent } from './drinks/pages/drink-list/drink-list.component';
import { DrinkDetailComponent } from './drinks/pages/drink-detail/drink-detail.component';

import { DrinkThemeFormComponent } from './drink-themes/pages/drink-theme-form/drink-theme-form.component';
import { DrinkThemeListComponent } from './drink-themes/pages/drink-theme-list/drink-theme-list.component';
import { DrinkThemeDetailComponent } from './drink-themes/pages/drink-theme-detail/drink-theme-detail.component';

import { EventListComponent } from './events/pages/event-list/event-list.component';
import { EventCalendarComponent } from './events/pages/event-calendar/event-calendar.component';
import { EventDetailComponent } from './events/pages/event-detail/event-detail.component';

import { InventoryListComponent } from './inventory/pages/inventory-list/inventory-list.component';

import { PackageListComponent } from './packages/pages/packages-list/packages-list.component';
import { PackageDetailComponent } from './packages/pages/package-detail/package-detail.component';
import { PackageFormComponent } from './packages/pages/package-form/package-form.component';

import { ReportsDashboardComponent } from './reports/pages/reports-dashboard/reports-dashboard.component';

import { ReservationCalendarComponent } from './reservations/pages/reservation-calendar/reservation-calendar.component';
import { ReservationDetailComponent } from './reservations/pages/reservation-detail/reservation-detail.component';
import { ReservationFormComponent } from './reservations/pages/reservation-form/reservation-form.component';
import { ReservationListComponent } from './reservations/pages/reservation-list/reservation-list.component';
import { ReservationSummaryComponent } from './reservations/pages/reservation-summary/reservation-summary.component';

import { SupplierListComponent } from './suppliers/pages/supplier-list/supplier-list.component';

/* 🔥 NUEVOS IMPORTS */
import { RequestListComponent } from './requests/pages/request-list/request-list.component';
import { RequestDetailComponent } from './requests/pages/request-detail/request-detail.component';

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Bar Types
      { path: 'bar-types', component: BarTypeListComponent },
      { path: 'bar-types/new', component: BarTypeFormComponent },
      { path: 'bar-types/:id/edit', component: BarTypeFormComponent },
      { path: 'bar-types/:id', component: BarTypeFormComponent },

      // Bartenders
      { path: 'bartenders', component: BartenderListComponent },
      { path: 'bartenders/new', component: BartenderFormComponent },
      { path: 'bartenders/:id/edit', component: BartenderFormComponent },
      { path: 'bartenders/:id', component: BartenderDetailComponent },

      // Clients
      { path: 'clients', component: ClientListComponent },
      { path: 'clients/new', component: ClientFormComponent },
      { path: 'clients/:id/edit', component: ClientFormComponent },
      { path: 'clients/:id', component: ClientDetailComponent },

      // Dashboard
      { path: 'dashboard', component: DashboardHomeComponent },

      // 🔥 REQUESTS (INBOX DESDE ODOO)
      { path: 'requests', component: RequestListComponent },
      { path: 'requests/:id', component: RequestDetailComponent },

      // Drink Themes
      { path: 'drink-themes', component: DrinkThemeListComponent },
      { path: 'drink-themes/new', component: DrinkThemeFormComponent },
      { path: 'drink-themes/:id/edit', component: DrinkThemeFormComponent },
      { path: 'drink-themes/:id', component: DrinkThemeDetailComponent },

      // Drinks
      { path: 'drinks', component: DrinkListComponent },
      { path: 'drinks/new', component: DrinkFormComponent },
      { path: 'drinks/:id/edit', component: DrinkFormComponent },
      { path: 'drinks/:id', component: DrinkDetailComponent },

      // Events
      { path: 'events', component: EventListComponent },
      { path: 'events/calendar', component: EventCalendarComponent },
      { path: 'events/:id', component: EventDetailComponent },

      // Inventory
      { path: 'inventory', component: InventoryListComponent },

      // Packages
      { path: 'packages', component: PackageListComponent },
      { path: 'packages/new', component: PackageFormComponent },
      { path: 'packages/:id/edit', component: PackageFormComponent },
      { path: 'packages/:id', component: PackageDetailComponent },

      // Reports
      { path: 'reports', component: ReportsDashboardComponent },

      // Reservations
      { path: 'reservations', component: ReservationListComponent },
      { path: 'reservations/new', component: ReservationFormComponent },
      { path: 'reservations/calendar', component: ReservationCalendarComponent },
      { path: 'reservations/:id/summary', component: ReservationSummaryComponent },
      { path: 'reservations/:id/edit', component: ReservationFormComponent },
      { path: 'reservations/:id', component: ReservationDetailComponent },

      // Suppliers
      { path: 'suppliers', component: SupplierListComponent },


    ],
  },
];
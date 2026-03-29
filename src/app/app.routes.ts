

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { BartenderFormComponent } from './bartenders/pages/bartender-form/bartender-form.component';
import { BartenderListComponent } from './bartenders/pages/bartender-list/bartender-list.component';
import { BarTypeFormComponent } from './bar-types/pages/bar-type-form/bar-type-form.component';
import { BarTypeListComponent } from './bar-types/pages/bar-type-list/bar-type-list.component';
import { ClientFormComponent } from './clients/pages/client-form/client-form.component';
import { ClientListComponent } from './clients/pages/client-list/client-list.component';
import { DashboardHomeComponent } from './dashboard/pages/dashboard-home/dashboard-home.component';
import { DrinkFormComponent } from './drinks/pages/drink-form/drink-form.component';
import { DrinkListComponent } from './drinks/pages/drink-list/drink-list.component';
import { DrinkThemeFormComponent } from './drink-themes/pages/drink-theme-form/drink-theme-form.component';
import { DrinkThemeListComponent } from './drink-themes/pages/drink-theme-list/drink-theme-list.component';

import { EventListComponent } from './events/pages/event-list/event-list.component';
import { EventDetailComponent } from './events/pages/event-detail/event-detail.component';

import { InventoryListComponent } from './inventory/pages/inventory-list/inventory-list.component';
import { PackageListComponent } from './packages/pages/packages-list/packages-list.component';
import { ReportsDashboardComponent } from './reports/pages/reports-dashboard/reports-dashboard.component';

import { ReservationCalendarComponent } from './reservations/pages/reservation-calendar/reservation-calendar.component';
import { ReservationDetailComponent } from './reservations/pages/reservation-detail/reservation-detail.component';
import { ReservationFormComponent } from './reservations/pages/reservation-form/reservation-form.component';
import { ReservationListComponent } from './reservations/pages/reservation-list/reservation-list.component';
import { ReservationSummaryComponent } from './reservations/pages/reservation-summary/reservation-summary.component';

import { Routes } from '@angular/router';
import { SupplierListComponent } from './suppliers/pages/supplier-list/supplier-list.component';


export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'bar-types', component: BarTypeListComponent },
      { path: 'bar-types/new', component: BarTypeFormComponent},
      { path: 'bartenders', component: BartenderListComponent },
      { path: 'bartenders/new', component: BartenderFormComponent},
      { path: 'clients', component: ClientListComponent },
      { path: 'clients/new', component: ClientFormComponent},
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'drink-themes', component: DrinkThemeListComponent },
      { path: 'drink-themes/new', component: DrinkThemeFormComponent},
      { path: 'drinks', component: DrinkListComponent},
      { path: 'drinks/new', component: DrinkFormComponent},
      { path: 'events', component: EventListComponent},
      { path: 'events/:id', component: EventDetailComponent},
      { path: 'inventory', component: InventoryListComponent },
      { path: 'packages', component: PackageListComponent },
      { path: 'reports', component: ReportsDashboardComponent },
      { path: 'reservations/:id', component: ReservationDetailComponent},
      { path: 'reservations/:id/summary', component: ReservationSummaryComponent},
      { path: 'reservations/calendar', component: ReservationCalendarComponent },
      { path: 'reservations/list', component: ReservationListComponent },
      { path: 'reservations/new', component: ReservationFormComponent },
      { path: 'suppliers', component: SupplierListComponent },


    ]
  }
];
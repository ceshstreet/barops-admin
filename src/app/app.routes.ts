import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardHomeComponent } from './dashboard/pages/dashboard-home/dashboard-home.component';
import { ReservationCalendarComponent } from './reservations/pages/reservation-calendar/reservation-calendar.component';
import { ReservationListComponent } from './reservations/pages/reservation-list/reservation-list.component';
import { ClientListComponent } from './clients/pages/client-list/client-list.component';
import { BartenderListComponent } from './bartenders/pages/bartender-list/bartender-list.component';
import { BarTypeListComponent } from './bar-types/pages/bar-type-list/bar-type-list.component';
import { InventoryListComponent } from './inventory/pages/inventory-list/inventory-list.component';
import { SupplierListComponent } from './suppliers/pages/supplier-list/supplier-list.component';
import { ReportsDashboardComponent } from './reports/pages/reports-dashboard/reports-dashboard.component';
import { ReservationFormComponent } from './reservations/pages/reservation-form/reservation-form.component';
import { ReservationDetailComponent } from './reservations/pages/reservation-detail/reservation-detail.component';
import { ClientFormComponent } from './clients/pages/client-form/client-form.component';
import { BartenderFormComponent } from './bartenders/pages/bartender-form/bartender-form.component';
import { BarTypeFormComponent } from './bar-types/pages/bar-type-form/bar-type-form.component';
import { PackageListComponent } from './packages/pages/packages-list/packages-list.component';
import { DrinkThemeListComponent } from './drink-themes/pages/drink-theme-list/drink-theme-list.component';
import { DrinkThemeFormComponent } from './drink-themes/pages/drink-theme-form/drink-theme-form.component';



export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'reservations/calendar', component: ReservationCalendarComponent },
      { path: 'reservations/list', component: ReservationListComponent },
      { path: 'clients', component: ClientListComponent },
      { path: 'bartenders', component: BartenderListComponent },
      { path: 'bar-types', component: BarTypeListComponent },
      { path: 'inventory', component: InventoryListComponent },
      { path: 'suppliers', component: SupplierListComponent },
      { path: 'reports', component: ReportsDashboardComponent },
      { path: 'reservations/new', component: ReservationFormComponent },
      { path: 'reservations/:id', component: ReservationDetailComponent},
      { path: 'clients/new', component: ClientFormComponent},
      { path: 'bartenders/new', component: BartenderFormComponent},
      { path: 'bar-types/new', component: BarTypeFormComponent},
      { path: 'packages', component: PackageListComponent },
      { path: 'drink-themes', component: DrinkThemeListComponent },
      {path: 'drink-themes/new', component: DrinkThemeFormComponent},


    ]
  }
];
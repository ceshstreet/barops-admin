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


    ]
  }
];
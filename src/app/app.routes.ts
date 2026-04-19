import { Routes } from '@angular/router';
import { authGuard }  from './auth/guards/auth.guard';
import { roleGuard }  from './auth/guards/role.guard';

// ── Layouts ─────────────────────────────────────────────────────────────────
import { AdminLayoutComponent }     from './layout/admin-layout/admin-layout.component';
import { BartenderLayoutComponent } from './layout/bartender-layout/bartender-layout.component';

// ── Auth pages (públicas) ────────────────────────────────────────────────────
import { LoginComponent }         from './auth/pages/login/login.component';
import { AcceptInviteComponent }  from './auth/pages/accept-invite/accept-invite.component';
import { SetupComponent }         from './auth/pages/setup/setup.component';

// ── Admin pages ──────────────────────────────────────────────────────────────
import { BartenderFormComponent }    from './bartenders/pages/bartender-form/bartender-form.component';
import { BartenderListComponent }    from './bartenders/pages/bartender-list/bartender-list.component';
import { BartenderDetailComponent }  from './bartenders/pages/bartender-detail/bartender-detail.component';
import { BarTypeFormComponent }      from './bar-types/pages/bar-type-form/bar-type-form.component';
import { BarTypeListComponent }      from './bar-types/pages/bar-type-list/bar-type-list.component';
import { ClientFormComponent }       from './clients/pages/client-form/client-form.component';
import { ClientListComponent }       from './clients/pages/client-list/client-list.component';
import { ClientDetailComponent }     from './clients/pages/client-detail/client-detail.component';
import { DashboardHomeComponent }    from './dashboard/pages/dashboard-home/dashboard-home.component';
import { DrinkFormComponent }        from './drinks/pages/drink-form/drink-form.component';
import { DrinkListComponent }        from './drinks/pages/drink-list/drink-list.component';
import { DrinkDetailComponent }      from './drinks/pages/drink-detail/drink-detail.component';
import { DrinkThemeFormComponent }   from './drink-themes/pages/drink-theme-form/drink-theme-form.component';
import { DrinkThemeListComponent }   from './drink-themes/pages/drink-theme-list/drink-theme-list.component';
import { DrinkThemeDetailComponent } from './drink-themes/pages/drink-theme-detail/drink-theme-detail.component';
import { EventListComponent }        from './events/pages/event-list/event-list.component';
import { EventCalendarComponent }    from './events/pages/event-calendar/event-calendar.component';
import { EventDetailComponent }      from './events/pages/event-detail/event-detail.component';
import { InventoryListComponent }    from './inventory/pages/inventory-list/inventory-list.component';
import { PackageListComponent }      from './packages/pages/packages-list/packages-list.component';
import { PackageDetailComponent }    from './packages/pages/package-detail/package-detail.component';
import { PackageFormComponent }      from './packages/pages/package-form/package-form.component';
import { ReportsDashboardComponent } from './reports/pages/reports-dashboard/reports-dashboard.component';
import { ReservationCalendarComponent } from './reservations/pages/reservation-calendar/reservation-calendar.component';
import { ReservationDetailComponent }   from './reservations/pages/reservation-detail/reservation-detail.component';
import { ReservationFormComponent }     from './reservations/pages/reservation-form/reservation-form.component';
import { ReservationListComponent }     from './reservations/pages/reservation-list/reservation-list.component';
import { ReservationSummaryComponent }  from './reservations/pages/reservation-summary/reservation-summary.component';
import { SupplierListComponent }     from './suppliers/pages/supplier-list/supplier-list.component';
import { QuoteListComponent }        from './quotes/pages/quote-list/quote-list.component';
import { QuoteFormComponent }        from './quotes/pages/quote-form/quote-form.component';
import { QuoteDetailComponent }      from './quotes/pages/quote-detail/quote-detail.component';
import { QuoteBuilderComponent }     from './quotes/pages/quote-builder/quote-builder.component';
import { QuotePdfPreviewComponent }  from './quotes/pages/quote-pdf-preview/quote-pdf-preview.component';
import { RequestListComponent }      from './requests/pages/request-list/request-list.component';
import { RequestDetailComponent }    from './requests/pages/request-detail/request-detail.component';
import { AddOnListComponent }        from './add-ons/pages/add-on-list/add-on-list.component';
import { AddOnFormComponent }        from './add-ons/pages/add-on-form/add-on-form.component';
import { AdminListComponent }        from './admins/pages/admin-list/admin-list.component';

// ── Bartender pages ──────────────────────────────────────────────────────────
import { BartenderDashboardComponent } from './bartenders/pages/bartender-dashboard/bartender-dashboard.component';

export const routes: Routes = [

  // ── Páginas públicas ────────────────────────────────────────────────────────
  { path: 'login',          component: LoginComponent },
  { path: 'accept-invite',  component: AcceptInviteComponent },
  { path: 'setup',          component: SetupComponent },
  { path: 'quotes/:id/pdf-preview', component: QuotePdfPreviewComponent },

  // ── Portal Admin ────────────────────────────────────────────────────────────
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard('admin')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'bar-types',           component: BarTypeListComponent },
      { path: 'bar-types/new',       component: BarTypeFormComponent },
      { path: 'bar-types/:id/edit',  component: BarTypeFormComponent },
      { path: 'bar-types/:id',       component: BarTypeFormComponent },

      { path: 'bartenders',          component: BartenderListComponent },
      { path: 'bartenders/new',      component: BartenderFormComponent },
      { path: 'bartenders/:id/edit', component: BartenderFormComponent },
      { path: 'bartenders/:id',      component: BartenderDetailComponent },

      { path: 'clients',             component: ClientListComponent },
      { path: 'clients/new',         component: ClientFormComponent },
      { path: 'clients/:id/edit',    component: ClientFormComponent },
      { path: 'clients/:id',         component: ClientDetailComponent },

      { path: 'dashboard',           component: DashboardHomeComponent },

      { path: 'requests',            component: RequestListComponent },
      { path: 'requests/:id',        component: RequestDetailComponent },

      { path: 'drink-themes',              component: DrinkThemeListComponent },
      { path: 'drink-themes/new',          component: DrinkThemeFormComponent },
      { path: 'drink-themes/:id/edit',     component: DrinkThemeFormComponent },
      { path: 'drink-themes/:id',          component: DrinkThemeDetailComponent },

      { path: 'drinks',              component: DrinkListComponent },
      { path: 'drinks/new',          component: DrinkFormComponent },
      { path: 'drinks/:id/edit',     component: DrinkFormComponent },
      { path: 'drinks/:id',          component: DrinkDetailComponent },

      { path: 'events',              component: EventListComponent },
      { path: 'events/calendar',     component: EventCalendarComponent },
      { path: 'events/:id',          component: EventDetailComponent },

      { path: 'inventory',           component: InventoryListComponent },

      { path: 'packages',            component: PackageListComponent },
      { path: 'packages/new',        component: PackageFormComponent },
      { path: 'packages/:id/edit',   component: PackageFormComponent },
      { path: 'packages/:id',        component: PackageDetailComponent },

      { path: 'reports',             component: ReportsDashboardComponent },

      { path: 'reservations',                  component: ReservationListComponent },
      { path: 'reservations/new',              component: ReservationFormComponent },
      { path: 'reservations/calendar',         component: ReservationCalendarComponent },
      { path: 'reservations/:id/summary',      component: ReservationSummaryComponent },
      { path: 'reservations/:id/edit',         component: ReservationFormComponent },
      { path: 'reservations/:id',              component: ReservationDetailComponent },

      { path: 'suppliers',           component: SupplierListComponent },

      { path: 'add-ons',             component: AddOnListComponent },
      { path: 'add-ons/new',         component: AddOnFormComponent },
      { path: 'add-ons/:id/edit',    component: AddOnFormComponent },

      { path: 'admins',              component: AdminListComponent },

      { path: 'quotes',              component: QuoteListComponent },
      { path: 'quotes/new',          component: QuoteFormComponent },
      { path: 'quotes/:id/edit',     component: QuoteFormComponent },
      { path: 'quotes/:id/build',    component: QuoteBuilderComponent },
      { path: 'quotes/:id',          component: QuoteDetailComponent },
    ],
  },

  // ── Portal Bartender ────────────────────────────────────────────────────────
  {
    path: 'bartender',
    component: BartenderLayoutComponent,
    canActivate: [authGuard, roleGuard('bartender')],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: BartenderDashboardComponent },
      { path: 'events',    component: BartenderDashboardComponent },

      // Catálogo — solo lectura en este portal
      { path: 'drinks',              component: DrinkListComponent },
      { path: 'drinks/:id',          component: DrinkDetailComponent },
      { path: 'packages',            component: PackageListComponent },
      { path: 'packages/:id',        component: PackageDetailComponent },
      { path: 'bar-types',           component: BarTypeListComponent },
      { path: 'drink-themes',        component: DrinkThemeListComponent },
      { path: 'drink-themes/:id',    component: DrinkThemeDetailComponent },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];

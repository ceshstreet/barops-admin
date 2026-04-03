import { Routes } from '@angular/router';
import { RequestListComponent } from './pages/request-list/request-list.component';
import { RequestDetailComponent } from './pages/request-detail/request-detail.component';

export const REQUESTS_ROUTES: Routes = [
  {
    path: '',
    component: RequestListComponent
  },
  {
    path: ':id',
    component: RequestDetailComponent
  }
];
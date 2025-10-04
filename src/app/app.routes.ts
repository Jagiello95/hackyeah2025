import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Map } from './components/map/map';

export const routes: Routes = [
  {
    path: 'map',
    component: Map,
  },

  {
    path: '',
    component: Dashboard,
  },
];

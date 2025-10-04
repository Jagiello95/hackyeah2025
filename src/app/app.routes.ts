import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { MapComponent } from './components/map/map';

export const routes: Routes = [
  {
    path: 'map',
    component: MapComponent,
  },

  {
    path: '',
    component: Dashboard,
  },
];

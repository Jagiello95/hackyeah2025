import { Component, inject } from '@angular/core';
import { initBounceTimeout } from '../constants';
import { Navigation } from '../../services/navigation';
import { filter, take } from 'rxjs';
import { API } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected init = false;
  protected navigation = inject(Navigation);
  protected api = inject(API);

  protected alerts: any[] = [];

  ngOnInit(): void {
    setTimeout(() => {
      this.init = true;
    }, initBounceTimeout);

    this.navigation.redirect$
      .pipe(
        filter((url) => !window.location.href.includes(url)),
        take(1)
      )
      .subscribe(() => {
        this.init = false;
      });

    this.api.fetchAlerts().subscribe((alerts) => {
      this.alerts = alerts;
      console.log(alerts);
    });
  }
}

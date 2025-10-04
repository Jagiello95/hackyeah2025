import { Component, inject } from '@angular/core';
import { alertShipIds, initBounceTimeout } from '../constants';
import { Navigation } from '../../services/navigation';
import { filter, take } from 'rxjs';
import { API } from '../../services/api';
import { MatIconModule } from '@angular/material/icon';
import { AlertType } from '../../models/alert.model';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterModule } from '@angular/router';
import { Store } from '../../services/store';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule, MatSlideToggleModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected init = false;
  protected navigation = inject(Navigation);
  protected store = inject(Store);

  protected api = inject(API);
  protected router = inject(Router);

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

  public onCardClick(alert: AlertType) {
    this.store.selectedAlert$.next(alert);
    this.router.navigate(['/map']);
  }

  public getIcon(alert: AlertType): string {
    if (alert.alerT_TYPE === 'DANGER') {
      return 'crisis_alert';
    }

    return 'earthquake';
  }
}

import { Component, inject } from '@angular/core';
import { alertShipIds, getIcon, initBounceTimeout } from '../constants';
import { Navigation } from '../../services/navigation';
import { filter, forkJoin, Observable, take } from 'rxjs';
import { API } from '../../services/api';
import { MatIconModule } from '@angular/material/icon';
import { AlertType } from '../../models/alert.model';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterModule } from '@angular/router';
import { Store } from '../../services/store';
import { ThreatType } from '../../models/alert.enum';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule, MatSlideToggleModule, RouterModule, DatePipe],
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
  public getIconFn = getIcon;

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
      this.alerts = alerts.map((alert, i) => ({ ...alert, id: i }));
      console.log(alerts);
    });

    // this.api.getOpenApiAlerts().subscribe((res) => {
    //   console.log('--->', res);
    // });
  }

  public onCardClick(alert: AlertType) {
    this.store.selectedAlert$.next(alert);
    this.router.navigate(['/map']);
  }

  public getTimeOffsetString(dateInput: string | Date): string {
    const now = new Date();
    const target = new Date(dateInput);
    const diffMs = target.getTime() - now.getTime();

    const isPast = diffMs < 0;
    const absMs = Math.abs(diffMs);

    const hours = Math.floor(absMs / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);

    const result = parts.join(' ');
    return isPast ? `${result} ago` : `in ${result}`;
  }

  public getAIAlerts(): Observable<AlertType[]> {
    return this.api.getOpenApiAlerts();
  }
}

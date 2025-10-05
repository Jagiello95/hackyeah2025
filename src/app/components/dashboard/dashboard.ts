import { Component, inject } from '@angular/core';
import { getIcon, initBounceTimeout } from '../constants';
import { Navigation } from '../../services/navigation';
import { combineLatest, delay, filter, map, Observable, startWith, take } from 'rxjs';
import { API } from '../../services/api';
import { MatIconModule } from '@angular/material/icon';
import { AlertType } from '../../models/alert.model';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterModule } from '@angular/router';
import { Store } from '../../services/store';
import { ThreatType } from '../../models/alert.enum';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatIconModule,
    MatSlideToggleModule,
    RouterModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
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

  protected filter = new FormControl('');
  protected danger = new FormControl(true);
  protected info = new FormControl(true);
  protected warn = new FormControl(true);

  protected allowed: string[] = ['DANGER', 'WARNING', 'INFO'];

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
    });

    this.api
      .getOpenApiAlerts()
      .pipe(
        map((res) =>
          res.map(
            (unit: any) =>
              ({
                alerT_TYPE: unit.ALERT_TYPE,
                shiP_IDS: [unit.SHIP_ID],
                reason: unit.REASON.length > 80 ? `${unit.REASON.slice(0, 80)}...` : unit.REASON,
                id: unit.SHIP_ID,
                timestamp: new Date().toUTCString(),
                position: unit.POSITION ?? 'International Waters',
                zoomLevel: 5,
                description: unit.REASON,
                type: ThreatType.ai,
              } as AlertType)
          )
        ),
        delay(3000)
      )
      .subscribe((res: AlertType[]) => {
        this.alerts = [...res, ...this.alerts];
      });

    combineLatest([
      this.danger.valueChanges.pipe(startWith(true)),
      this.warn.valueChanges.pipe(startWith(true)),
      this.info.valueChanges.pipe(startWith(true)),
    ]).subscribe(([danger, warn, info]) => {
      this.allowed = [];

      if (danger) {
        this.allowed.push('DANGER');
      }

      if (warn) {
        this.allowed.push('WARNING');
      }

      if (info) {
        this.allowed.push('INFO');
      }
    });
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

  public isAllowed(alert: AlertType): boolean {
    const togglesAllowed = this.allowed.includes(alert.alerT_TYPE);

    if (!this.filter.value) {
      return togglesAllowed;
    }

    const filterAllowed = [alert.reason, alert.alerT_TYPE, alert.position].some((match) => {
      return match?.toLowerCase().includes((this.filter.value ?? '').toLowerCase());
    });

    return togglesAllowed && filterAllowed;
  }
}

import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe } from '@angular/common';
import { Navigation } from './services/navigation';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Sidenav } from './components/sidenav/sidenav';
import { concatMap, map, timer } from 'rxjs';
import { API } from './services/api';
import { Store } from './services/store';
import { MTShipData } from './models/mt-ship-data.model';

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatProgressBarModule,
    Sidenav,
    AsyncPipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('hackyeah2025');

  private api = inject(API);
  private store = inject(Store);

  protected navigation = inject(Navigation);
  protected router = inject(Router);

  private assignRedirection(): void {
    this.navigation.redirect$
      .pipe(concatMap((url) => timer(this.getExitDelay(url)).pipe(map(() => url))))
      .subscribe((path: string) => {
        this.router.navigate([path]);
      });
  }

  ngOnInit(): void {
    this.api.fetchShips().subscribe((res: MTShipData[]) => {
      this.store.shipData$.next(res);
    });
    this.assignRedirection();
  }

  private getExitDelay(route: string): number {
    if (window.location.href.includes('dashboard')) {
      return 800;
    }

    if (window.location.href.includes('map')) {
      return 500;
    }

    return 500;
  }
}

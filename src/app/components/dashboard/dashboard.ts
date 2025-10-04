import { Component, inject } from '@angular/core';
import { initBounceTimeout } from '../constants';
import { Navigation } from '../../services/navigation';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected init = false;
  protected navigation = inject(Navigation);
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
  }
}

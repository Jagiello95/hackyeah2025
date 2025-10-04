import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Navigation } from '../../services/navigation';
import { BehaviorSubject, filter, take } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { initBounceTimeout } from '../constants';
import { API } from '../../services/api';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  imports: [ReactiveFormsModule, MatSlideToggle, MatButtonModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  protected api = inject(API);

  protected nav = inject(Navigation);
  protected toggle$ = new BehaviorSubject(false);
  protected init: boolean = false;

  ngOnInit() {
    setTimeout(() => {
      this.init = true;
    }, initBounceTimeout);

    this.api.fetchShips().subscribe((res) => {
      console.log(res);
    });
    this.nav.redirect$
      .pipe(
        filter((url) => !window.location.href.includes(url)),
        take(1)
      )
      .subscribe(() => {
        this.init = false;
      });
  }
}

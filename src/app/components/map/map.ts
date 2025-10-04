import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Navigation } from '../../services/navigation';
import { BehaviorSubject, filter, take } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { initBounceTimeout } from '../constants';
import { API } from '../../services/api';
import { HttpClient } from '@angular/common/http';
import * as maplibregl from 'maplibre-gl';
import * as data from './style.json';

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
  map!: maplibregl.Map;

  protected init = false;
  style: any;
  private afterViewTimeout = 0;

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

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, this.afterViewTimeout);
  }

  private initMap() {
    this.style = JSON.parse(JSON.stringify(data));

    this.map = new maplibregl.Map({
      container: 'map',
      style: this.style,
      center: [7, 60],
      zoom: 0,
    });

    this.map.on('load', async () => {
      const image = await this.map.loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png'
      );
      this.map.addImage('cat', image.data);
      this.map.addSource('point', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [0, 0],
              } as any,
            } as any,
          ],
        },
      });
    });
  }
}

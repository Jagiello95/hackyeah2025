import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Navigation } from '../../services/navigation';
import { BehaviorSubject, filter, take } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { initBounceTimeout } from '../constants';
import { API } from '../../services/api';
import { HttpClient } from '@angular/common/http';
import * as maplibregl from 'maplibre-gl';
import * as data from './style.json';
import { MTShipData } from '../../models/mt-ship-data.model';
import { MapShipPoint } from '../../models/map-ship-point.model';
import { Store } from '../../services/store';
import { Sidebar } from '../sidebar/sidebar';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-map',
  imports: [ReactiveFormsModule, MatSlideToggle, MatButtonModule, Sidebar, AsyncPipe],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class MapComponent {
  protected api = inject(API);

  protected nav = inject(Navigation);
  protected store = inject(Store);
  protected toggle$ = new BehaviorSubject(false);
  map!: maplibregl.Map;

  protected marineTraffic = new FormControl(false);
  protected mock = new FormControl(false);
  protected trackShips = new FormControl(false);

  protected init = false;
  style: any;
  private afterViewTimeout = 0;

  protected ws: WebSocket | undefined;

  private shipsMap = new Map();

  ngOnInit() {
    setTimeout(() => {
      this.init = true;
    }, initBounceTimeout);

    this.marineTraffic.valueChanges.subscribe((shouldLoad: boolean | null) => {
      shouldLoad ? this.loadMarineTraffic() : this.removeMarineTraffic();
    });

    this.mock.valueChanges.subscribe((shouldMock: boolean | null) => {
      this.store.shouldMockData$.next(!!shouldMock);
    });

    this.trackShips.valueChanges.subscribe((shouldTrack: boolean | null) => {
      shouldTrack ? this.startWS() : this.closeWs();
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
      this.api.fetchShips().subscribe((res) => console.log(res));
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

  private removeMarineTraffic(): void {
    this.map.removeLayer('ships');
  }

  private loadMarineTraffic(): void {
    const data: MapShipPoint[] = [];
    this.api.fetchShips().subscribe((res: MTShipData[]) => {
      res.forEach((unit) => {
        data.push({
          lat: unit.lat,
          lng: unit.lon,
          mmsi: unit.shiP_ID,
        });
      });
    });

    this.map.addSource('ships', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    this.map.addLayer({
      id: 'ships-layer',
      type: 'circle',
      source: 'ships',
      paint: {
        'circle-radius': 4,
        'circle-color': 'lightcoral',
        'circle-stroke-color': 'gray',
        'circle-stroke-width': 0.8,
      },
    });

    const features = data.map((ship) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [ship.lng, ship.lat],
      },
      properties: {
        mmsi: ship.mmsi,
        // speed: ship.speed,
        // heading: ship.heading,
      },
    }));

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    (this.map.getSource('ships') as maplibregl.GeoJSONSource).setData(geojson as any);
  }

  private startWS(): void {
    console.log('start');
    // this.closeWs();
    this.ws = new WebSocket(this.api.getWSPath());

    this.ws.onopen = () => console.log('Connected to local WS bridge');

    this.ws.onmessage = (event) => {
      const data = event.data;
      // console.log(data);
      // return;
      if (data instanceof Blob) {
        // Read the Blob as text
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result as string).MetaData;

            // this.ships.push(json);
            const ship: any = {
              mmsi: parsed.MMSI,
              lat: parsed.latitude,
              lon: parsed.longitude,
              // speed: parsed.speed,
              heading: parsed.ShipName,
              timestamp: Date.now(),
            };

            if (!this.shipsMap.get(ship.mmsi)) {
              this.updateMap();
            }

            // Store/update ship
            this.shipsMap.set(ship.mmsi, ship);

            // this.ships.push(json);
          } catch (err) {
            console.error('Failed to parse JSON', err);
          }
        };
        reader.onerror = (err) => console.error('FileReader error', err);
        reader.readAsText(data);
      } else if (typeof data === 'string') {
        // Some messages may already be strings
        try {
        } catch (err) {
          console.error('Failed to parse JSON', err);
        }
      } else {
        console.warn('Unknown message type', data);
      }
    };

    this.ws.onerror = (err) => console.error('WS error', err);
  }

  private closeWs(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  private updateMap() {
    if (!this.map || !this.map.getSource('ships')) return;

    const features = Array.from(this.shipsMap.values()).map((ship) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [ship.lon, ship.lat],
      },
      properties: {
        mmsi: ship.mmsi,
        // speed: ship.speed,
        heading: ship.heading,
      },
    }));

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    (this.map.getSource('ships') as maplibregl.GeoJSONSource).setData(geojson as any);
  }
}

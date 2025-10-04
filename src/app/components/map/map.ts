import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Navigation } from '../../services/navigation';
import { BehaviorSubject, filter, take, tap } from 'rxjs';
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
import { FocusedShipPoint } from '../../models/focused-ship-point.model';

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

  protected countMap = new Map<number, number>();

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

    // this.registerShipClick();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
      this.updateMap();
    }, this.afterViewTimeout);
  }

  private initMap() {
    this.style = JSON.parse(JSON.stringify(data));

    this.map = new maplibregl.Map({
      container: 'map',
      style: this.style,
      center: [20, 50],
      zoom: 0,
    });

    // this.map.setRenderWorldCopies(false);

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
    this.nav.isLoading$.next(true);
    const data: MapShipPoint[] = [];
    this.api.fetchShips().subscribe((res: MTShipData[]) => {
      console.log(res.length);

      this.map.addSource('ships', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      res.forEach((unit) => {
        data.push({
          lat: unit.lat,
          lng: unit.lon,
          mmsi: unit.shiP_ID,
          shipType: unit.shiptype,
          shipName: unit.shipname,
        });
      });

      this.loadData(data);

      this.map.addLayer({
        id: 'ships',
        type: 'circle',
        source: 'ships',
        paint: {
          'circle-radius': 4,
          // 'circle-color': 'lightcoral',
          'circle-stroke-color': 'gray',
          'circle-stroke-width': 0.8,
          'circle-color': [
            'match',
            ['get', 'threatLevel'],
            'high',
            '#FF6B6B', // pastel danger
            'medium',
            '#FFD166', // amber warning
            'low',
            '#06D6A0', // safe green
            '#999999', // default
          ],
        },
      });
      this.nav.isLoading$.next(false);
    });

    this.registerShipClick();
  }

  private startWS(): void {
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
        data: {
          mmsi: ship.mmsi,
          // speed: ship.speed,
          heading: ship.heading,
        },
      },
    }));

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    (this.map.getSource('ships') as maplibregl.GeoJSONSource).setData(geojson as any);
  }

  private addSonarElement(coordinates: [number, number]): void {
    // create a DOM element for the marker
    const el = document.createElement('div');
    el.classList.add('marker');
    el.classList.add('sonar-wrapper');

    const el2 = document.createElement('div');
    el2.classList.add('sonar-emitter');
    // el2.classList.add('center-absolute-xy');

    el.appendChild(el2);

    [1, 2, 3, 4].forEach((i) => {
      const elInner = document.createElement('div');
      el2.appendChild(elInner);
      elInner.classList.add('sonar-wave');
      elInner.classList.add(`sonar-wave-${i}`);
    });

    // el.className = 'marker';
    // el.style.backgroundImage = `url(https://picsum.photos/${marker.properties.iconSize.join(
    //   '/'
    // )}/)`;
    // el.style.width = `${marker.properties.iconSize[0]}px`;
    // el.style.height = `${marker.properties.iconSize[1]}px`;

    el.style.width = '5';
    el.style.height = '5';
    // el.style['border-left' as any] = '10px solid transparent';
    // el.style['border-right' as any] = '10px solid transparent';

    // el.style['border-top' as any] = `20px solid yellow`;

    // add marker to map
    new maplibregl.Marker({ element: el }).setLngLat(coordinates).addTo(this.map);
  }

  private registerShipClick(): void {
    console.log('hello');
    this.map.on('click', 'ships', (e: any) => {
      console.log(e);
      const { lng, lat } = e.lngLat;

      console.log(lng, lat);
      const coordinates = e.features[0].geometry.coordinates.slice();
      const data: string = e.features[0].properties['data'];
      console.log(data);
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      this.toggle$.next(true);
      this.map.flyTo({
        padding: { right: 15 * 25 },
        center: coordinates,
        zoom: 4,
      });

      this.addSonarElement(coordinates);
      this.store.focusedShip$.next(JSON.parse(data));

      // new maplibregl.Popup().setLngLat(coordinates).setHTML(description).addTo(this.map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    this.map.on('mouseenter', 'ships', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    this.map.on('mouseleave', 'ships', () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  private assessThreatLevel(ship: MapShipPoint): 'high' | 'medium' | 'small' {
    if (!this.countMap.has(ship.shipType)) {
      this.countMap.set(ship.shipType, 0);
    }

    let currentValue = this.countMap.get(ship.shipType) ?? 0;
    this.countMap.set(ship.shipType, currentValue + 1);
    switch (ship.shipType) {
      case 0:
        return 'high';
      case 2:
        return 'medium';
      case 3:
        return 'small';
      case 7:
        return 'high';
      case 8:
        return 'small';
      default:
        return 'small';
    }
  }

  private loadData(data: MapShipPoint[]): void {
    this.countMap.clear();

    console.log(data);
    const features = data.map((ship) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [ship.lng, ship.lat],
      },
      properties: {
        threatLevel: this.assessThreatLevel(ship),
        data: {
          mmsi: ship.mmsi,
          shipType: `${ship.shipType}`,
          threatLevel: this.assessThreatLevel(ship),
          shipName: ship.shipName,
        } as FocusedShipPoint,

        // speed: ship.speed,
        // heading: ship.heading,
      },
    }));

    console.log(this.countMap.entries());

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    (this.map.getSource('ships') as maplibregl.GeoJSONSource).setData(geojson as any);
  }
}

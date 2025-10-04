import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Navigation } from '../../services/navigation';
import { BehaviorSubject, filter, from, fromEvent, map, switchMap, take, tap, timer } from 'rxjs';
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
import * as cables from './cable.json';
import * as turf from '@turf/turf';
import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

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

  protected marineTraffic = new FormControl(true);
  protected mock = new FormControl(false);
  protected trackShips = new FormControl(false);

  protected countMap = new Map<number, number>();
  protected cablesColor = '#5a647c';

  protected init = false;
  style: any;
  private afterViewTimeout = 0;

  protected ws: WebSocket | undefined;

  private shipsMap = new Map<string, MapShipPoint>();

  private subMarineCables = JSON.parse(JSON.stringify(cables));

  private activeAlerts: maplibregl.Marker[] = [];

  ngOnInit() {
    setTimeout(() => {
      this.init = true;
      // this.addPolygon();
    }, initBounceTimeout);

    // this.marineTraffic.valueChanges.subscribe((shouldLoad: boolean | null) => {
    //   shouldLoad ? this.loadMarineTraffic() : this.removeMarineTraffic();
    // });

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
      setTimeout(() => {
        this.updateMap();
        this.loadMarineTraffic();
      });
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
      this.addCables();
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
    this.store.shipData$.subscribe((res: MTShipData[] | null) => {
      if (!res) {
        return;
      }

      this.map.addSource('ships', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      this.map.addSource('ws-ships', {
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

      this.map.addLayer({
        id: 'ws-ships',
        type: 'circle',
        source: 'ws-ships',
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

      const alert = this.store.selectedAlert$.value;

      if (alert && alert.shiP_IDS.length > 1) {
        this.connectTwoPoints(alert?.shiP_IDS[0], alert?.shiP_IDS[1]);
      }

      if (alert && alert.historicalPositions) {
        this.handleHistoricalPos(alert.shiP_IDS[0], alert['historicalPositions']);
      }

      if (alert && alert.shouldDisplayTerritorialWaters) {
        // this.nav.isLoading$.next(true);
        // timer(2000)
        //   .pipe(
        //     switchMap(() => from(this.addPolandTerritorialWaters())),
        //     tap(() => {
        //       this.nav.isLoading$.next(false);
        //     })
        //   )
        //   .subscribe();
      }

      if (alert) {
        console.log(alert.zoomLevel);
        this.selectShip(alert.shiP_IDS[0], undefined, alert.zoomLevel);
      }
    });

    this.registerShipClick();
  }

  private startWS(): void {
    // this.closeWs();
    this.ws = new WebSocket('wss://good-vibes-realtime-ships-api.onrender.com');

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
            const ship: MapShipPoint = {
              mmsi: parsed.MMSI,
              lat: parsed.latitude,
              lng: parsed.longitude,
              shipName: parsed.ShipName,
              shipType: 1,
              // speed: parsed.speed,
              // heading: parsed.ShipName,
              // timestamp: Date.now(),
            };

            if (!this.shipsMap.get(ship.mmsi)) {
              this.addSonarElement([ship.lng, ship.lat], false, 1, true);
            }
            this.updateMap();

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
    if (!this.map || !this.map.getSource('ws-ships')) return;

    const features = Array.from(this.shipsMap.values()).map((ship) => {
      // const shipPoint: MapShipPoint = {
      //   lat: ship.
      //   lng: ship.
      //   mmsi: ship.
      //   shipType: ship.
      //   shipName: ship.
      // }
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ship.lng, ship.lat],
        },
        properties: {
          id: ship.mmsi,
          threatLevel: this.assessThreatLevel(ship),
          data: {
            mmsi: ship.mmsi,
            shipType: `${ship.shipType}`,
            threatLevel: this.assessThreatLevel(ship),
            shipName: ship.shipName,
          } as FocusedShipPoint,
        },
      };
    });

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    (this.map.getSource('ws-ships') as maplibregl.GeoJSONSource).setData(geojson as any);
  }

  private addSonarElement(
    coordinates: [number, number],
    isEmpty = false,
    numOfWaves = 4,
    singleEmission = false
  ): void {
    let color = isEmpty ? 'gray' : 'red';

    // create a DOM element for the marker
    const el = document.createElement('div');
    el.classList.add('marker');
    el.classList.add('sonar-wrapper');

    const el2 = document.createElement('div');
    el2.classList.add('sonar-emitter');

    if (isEmpty) {
      el2.classList.add('sonar-emitter--empty');
    }

    if (singleEmission) {
      color = 'cyan';
      el2.classList.add('sonar-emitter--single');
    }

    el2.classList.add(`sonar-emitter--${numOfWaves}`);

    // el2.classList.add('center-absolute-xy');

    el.appendChild(el2);

    Array.from({ length: numOfWaves }).forEach((_, index) => {
      const i = index + 1;
      const elInner = document.createElement('div');
      el2.appendChild(elInner);
      elInner.classList.add('sonar-wave');
      elInner.classList.add(`sonar-wave-${i}`);
      elInner.classList.add(`sonar-wave--${color}`);
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

    const marker = new maplibregl.Marker({ element: el }).setLngLat(coordinates).addTo(this.map);

    // add marker to map
    this.activeAlerts.push(marker);

    if (singleEmission) {
      setTimeout(() => {
        marker.remove();
      }, 1000);
    }
  }

  private registerShipClick(): void {
    this.map.on('click', 'ships', (e: any) => {
      this.activeAlerts.forEach((marker: maplibregl.Marker) => {
        marker.remove();
      });
      const { lng, lat } = e.lngLat;

      const coordinates = e.features[0].geometry.coordinates.slice();
      const id: string = e.features[0].properties['id'];
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const ship = this.findShipById(id);
      if (ship) {
        console.log('clicked ship', ship);
        this.selectShip(ship.shiP_ID, coordinates);
      }

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

    const features = data.map((ship) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [ship.lng, ship.lat],
      },
      properties: {
        id: ship.mmsi,
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

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    (this.map.getSource('ships') as maplibregl.GeoJSONSource).setData(geojson as any);
    if (this.store.selectedAlert$.value) {
      const ship = this.findShipById(this.store.selectedAlert$.value.shiP_IDS[0]);
      if (!ship) {
        return;
      }
      this.toggle$.next(true);
      this.map.flyTo({
        padding: { right: 15 * 25 },
        center: [ship?.lon, ship?.lat],
        zoom: 4,
      });
    }
  }

  public findShipById(id: string): MTShipData | null {
    if (!this.store.shipData$.value) {
      return null;
    }

    const selectedShip = this.store.shipData$.value.find((ship: MTShipData) => {
      return ship.shiP_ID === id;
    });

    return selectedShip ? selectedShip : null;
  }

  public selectShip(id: string, coordinates?: [number, number], zoomLevel = 6): void {
    const ship = this.findShipById(id);
    this.toggle$.next(true);

    if (!ship) {
      return;
    }
    console.log(zoomLevel);
    this.map.flyTo({
      padding: { right: 15 * 25 },
      center: coordinates ?? [ship.lon, ship.lat],
      zoom: zoomLevel,
    });

    this.addSonarElement(coordinates ?? [ship.lon, ship.lat]);
    this.store.focusedShip$.next(ship);
  }

  public addCables(): void {
    this.map.addSource('submarine-cables', {
      type: 'geojson',
      data: this.subMarineCables, // Or your local/data URL
    });

    this.map.addLayer({
      id: 'cable-lines',
      type: 'line',
      source: 'submarine-cables',
      paint: {
        'line-color': `${this.cablesColor}`, // Example color
        'line-width': 1,
      },
    });
  }

  public connectTwoPoints(shipId1: any, shipId2: any): void {
    const ship1 = this.findShipById(shipId1);
    const ship2 = this.findShipById(shipId2);

    console.log(ship1, ship2);

    if (!ship1 || !ship2) {
      return;
    }

    this.addSonarElement([ship2.lon, ship2.lat]);

    console.log('here');
    console.log([ship1.lat, ship1.lon], [ship2.lat, ship2.lon]);
    const routeGeoJSON: any = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [ship1.lon, ship1.lat],
          [ship2.lon, ship2.lat],
        ], // Example: [[-74.0060, 40.7128], [-73.9352, 40.7306]]
      },
    };

    this.map.addSource('route-source', {
      type: 'geojson',
      data: routeGeoJSON,
    });

    this.map.addLayer({
      id: 'route-layer',
      type: 'line',
      source: 'route-source',
      layout: {
        'line-join': 'round', // Optional: make lines round at joins
        'line-cap': 'round', // Optional: make lines round at the ends
      },
      paint: {
        'line-color': 'gray', // Color of the line
        'line-width': 1, // Width of the line
        'line-dasharray': [2, 2], // pattern: [dash length, gap length]
      },
    });
  }

  public handleHistoricalPos(
    shipId: string,
    historicalPositions: [number, number, boolean][]
  ): void {
    const ship = this.findShipById(shipId);

    if (!ship) {
      return;
    }

    this.addSonarElement([ship.lon, ship.lat]);

    historicalPositions.forEach((historicalPosition: [number, number, boolean], i: number) => {
      this.addSonarElement(
        [historicalPosition[0], historicalPosition[1]],
        historicalPosition[2],
        1
      );

      // const previous = i > 0 ? historicalPositions[i - 1] : [ship.lon, ship.lat];
      const layerName = `route-layer-${i}`;
      const sourceName = `route-source-${i}`;

      const previous =
        i === 0
          ? [ship.lon, ship.lat]
          : [historicalPositions[i - 1][0], historicalPositions[i - 1][1]];

      const current = [historicalPosition[0], historicalPosition[1]];

      const routeGeoJSON: any = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [previous[0], previous[1]],
            [current[0], current[1]],
          ], // Example: [[-74.0060, 40.7128], [-73.9352, 40.7306]]
        },
      };

      this.map.addSource(sourceName, {
        type: 'geojson',
        data: routeGeoJSON,
      });

      this.map.addLayer({
        id: layerName,
        type: 'line',
        source: sourceName,
        layout: {
          'line-join': 'round', // Optional: make lines round at joins
          'line-cap': 'round', // Optional: make lines round at the ends
        },
        paint: {
          'line-color': 'gray', // Color of the line
          'line-width': 1, // Width of the line
          'line-dasharray': [2, 2], // pattern: [dash length, gap length]
        },
      });
    });
  }

  /**
   * Approximate zoom level from distance (in meters)
   * Smaller distance → higher zoom
   */
  public estimateZoomFromDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371000; // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // meters

    // Approximate scale: 5000 km → zoom 2, 5 m → zoom 20
    const zoom = Math.max(2, Math.min(20, 20 - Math.log2(distance / 5)));

    return zoom;
  }

  async addPolandTerritorialWaters() {
    console.log('here');
    try {
      const resp = await fetch(
        'https://nominatim.openstreetmap.org/search.php?q=Poland&polygon_geojson=1&format=json',
        { headers: { 'User-Agent': 'angular-maplibre-turf/1.0' } }
      );
      const results = await resp.json();

      // const results: any = waterTerritorial;
      if (!results.length) throw new Error('No polygon returned');

      // Pick administrative boundary
      const country =
        results.find((r: any) => r.class === 'boundary' || r.type === 'administrative') ||
        results[0];
      let landGeoJSON = country.geojson;

      // Handle FeatureCollection
      if (landGeoJSON.type === 'FeatureCollection') {
        landGeoJSON = landGeoJSON.features[0].geometry;
      }

      const landFeature = turf.feature(landGeoJSON);

      // Buffer 12 nautical miles
      const territorialWaters = turf.buffer(landFeature, 12 * 1852, { units: 'meters' });

      // Subtract land to get only water
      let watersOnly: any;
      try {
        const collections: FeatureCollection<Polygon | MultiPolygon> = {
          type: 'FeatureCollection',
          features: [territorialWaters!, landFeature],
        };
        watersOnly = turf.difference(collections) || territorialWaters;
      } catch {
        watersOnly = territorialWaters;
      }

      // Add GeoJSON source
      this.map.addSource('poland-tw', { type: 'geojson', data: watersOnly });

      // Fill layer
      this.map.addLayer({
        id: 'tw-fill',
        type: 'fill',
        source: 'poland-tw',
        paint: { 'fill-color': '#2b6fb3', 'fill-opacity': 0.18 },
      });

      // Dashed outline
      this.map.addLayer({
        id: 'tw-outline',
        type: 'line',
        source: 'poland-tw',
        paint: { 'line-color': '#2b6fb3', 'line-width': 2, 'line-dasharray': [2, 6] },
      });

      // // Zoom to waters
      // const bbox = turf.bbox(watersOnly);
      // this.map.fitBounds(
      //   [
      //     [bbox[0], bbox[1]],
      //     [bbox[2], bbox[3]],
      //   ],
      //   { padding: 40 }
      // );

      console.log('Polish territorial waters displayed successfully!');
    } catch (err) {
      console.error('Error displaying waters:', err);
    }
  }

  // // polygon

  // public addPolygon(): void {
  //   let polygon: any = {
  //     type: 'FeatureCollection',
  //     features: [
  //       {
  //         type: 'Feature',
  //         geometry: { type: 'Polygon', coordinates: [[]] },
  //       },
  //     ],
  //   };

  //   this.map.on('dblclick', (e) => {
  //     polygon.features[0].geometry.coordinates[0].push([e.lngLat.lng, e.lngLat.lat]);

  //     if (!this.map.getSource('polygon-selection')) {
  //       this.map.addSource('polygon-selection', { type: 'geojson', data: polygon });
  //       this.map.addLayer({
  //         id: 'polygon-selection-layer',
  //         type: 'fill',
  //         source: 'polygon-selection',
  //         paint: { 'fill-color': '#00ff00', 'fill-opacity': 0.3 },
  //       });
  //     } else {
  //       (this.map.getSource('polygon-selection') as any)!.setData(polygon);
  //     }
  //   });

  //   this.map.on('dblclick', (e) => {
  //     console.log('Double-click detected at:', e.lngLat);
  //     // e.lngLat contains { lng, lat }
  //   });
  // }

  private updateShip(ship: MapShipPoint): void {
    console.log(ship);
  }
}

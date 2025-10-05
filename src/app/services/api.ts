import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MTShipData } from '../models/mt-ship-data.model';
import { of } from 'rxjs';
import { MOCK_DATA } from '../components/map/mock-data';
import { Store } from './store';
import { MOCK_ALERTS } from '../components/map/mock-alerts';
import { mockedChatAlerts } from '../components/constants';

@Injectable({
  providedIn: 'root',
})
export class API {
  private readonly API = 'https://goodvibesapi-dsetebgfaugxcfa2.westeurope-01.azurewebsites.net';
  private readonly store = inject(Store);
  public httpClient = inject(HttpClient);

  public fetchShips(): Observable<MTShipData[]> {
    if (this.store.shouldMockData$.value) {
      return of(MOCK_DATA);
    }
    // return of([]);
    return this.httpClient.get<MTShipData[]>(`${this.API}/ships`);
  }

  public fetchAlerts(): Observable<any[]> {
    if (true) {
      return of(MOCK_ALERTS);
    }
    return this.httpClient.get<any[]>(`${this.API}/alerts`);
  }

  public getWSPath(): string {
    return 'wss://goodvibesapi-dsetebgfaugxcfa2.westeurope-01.azurewebsites.net/ws';
  }

  public getPLTerritorial(): Observable<any> {
    return this.httpClient.get<MTShipData[]>(
      `'https://nominatim.openstreetmap.org/search.php?q=Poland&polygon_geojson=1&format=json';`
    );
  }

  public getOpenApiAlerts(): Observable<any> {
    return of(mockedChatAlerts);
    return this.httpClient.post<any[]>(`${this.API}/openaiapirequest/alerts`, {});
  }
}

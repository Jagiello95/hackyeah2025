import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MTShipData } from '../models/mt-ship-data.model';
import { of } from 'rxjs';
import { MOCK_DATA } from '../components/map/mock-data';
import { Store } from './store';

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
    return this.httpClient.get<MTShipData[]>(`${this.API}/ships`);
  }

  public getWSPath(): string {
    return 'wss://goodvibesapi-dsetebgfaugxcfa2.westeurope-01.azurewebsites.net/ws';
  }
}

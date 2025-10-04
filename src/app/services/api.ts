import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MTShipData } from '../models/mt-ship-data.model';

@Injectable({
  providedIn: 'root',
})
export class API {
  private readonly API = 'https://goodvibesapi-dsetebgfaugxcfa2.westeurope-01.azurewebsites.net';
  public httpClient = inject(HttpClient);

  public fetchShips(): Observable<MTShipData[]> {
    return this.httpClient.get<MTShipData[]>(`${this.API}/ships`);
  }
}

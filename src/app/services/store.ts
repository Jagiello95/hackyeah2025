import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MapShipPoint } from '../models/map-ship-point.model';
import { FocusedShipPoint } from '../models/focused-ship-point.model';

@Injectable({
  providedIn: 'root',
})
export class Store {
  public shouldMockData$ = new BehaviorSubject(false);
  public focusedShip$ = new BehaviorSubject<FocusedShipPoint | null>(null);
}

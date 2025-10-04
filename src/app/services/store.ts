import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MapShipPoint } from '../models/map-ship-point.model';
import { FocusedShipPoint } from '../models/focused-ship-point.model';
import { AlertType } from '../models/alert.model';
import { MTShipData } from '../models/mt-ship-data.model';

@Injectable({
  providedIn: 'root',
})
export class Store {
  public shouldMockData$ = new BehaviorSubject(false);
  public focusedShip$ = new BehaviorSubject<MTShipData | null>(null);
  public selectedAlert$ = new BehaviorSubject<AlertType | null>(null);
  public shipData$ = new BehaviorSubject<MTShipData[] | null>(null)
}

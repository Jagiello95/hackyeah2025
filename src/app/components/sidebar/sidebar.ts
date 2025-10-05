import { Component, HostBinding, inject, Input } from '@angular/core';
import { Store } from '../../services/store';
import { MapShipPoint } from '../../models/map-ship-point.model';
import { midCountryMap } from '../../constants/mid-to-country';
import { ShipTypes } from '../../constants/ship-type';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @HostBinding('class.is-sidebar-expanded') get isExpandedClass(): boolean {
    return this.isExpanded;
  }
  @HostBinding('class.is-sidebar-fixed') get isFixedClass(): boolean {
    return !!this.fixed;
  }

  @Input() toggled: boolean | null = false;
  @Input() fixed: boolean | null = false;

  private store = inject(Store);

  protected selectedShip: MapShipPoint | null = null;
  protected isExpanded = false;

  ngOnInit(): void {
    this.store.focusedShip$.subscribe((ship: MapShipPoint | null) => {
      this.selectedShip = ship;
    });
  }

  ngOnChanges(changes: any): void {
    if (changes.toggled) {
      this.isExpanded = changes.toggled.currentValue;
    }
  }

  public getShipCountry(ship: MapShipPoint) {
    const prefix = +`${ship.mmsi}`.substring(0, 3);
    return isNaN(prefix) ? '' : midCountryMap[prefix];
  }

  public getShipType(ship: MapShipPoint) {
    if (!ship.shipType) {
      return 'Unknown';
    }
    return ShipTypes[+ship.shipType] ?? 'Unknown';
  }

  public getThreatLevel(ship: MapShipPoint) {
    if (ship.mmsi === '') {
      return 'high';
    }
    return 'medium';
  }
}

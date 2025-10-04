import { Component, HostBinding, inject, Input } from '@angular/core';
import { Store } from '../../services/store';
import { MapShipPoint } from '../../models/map-ship-point.model';
import { FocusedShipPoint } from '../../models/focused-ship-point.model';
import { midCountryMap } from '../../constants/mid-to-country';
import { ShipTypes } from '../../constants/ship-type';
import { MTShipData } from '../../models/mt-ship-data.model';

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

  protected selectedShip: MTShipData | null = null;
  protected isExpanded = false;

  ngOnInit(): void {
    this.store.focusedShip$.subscribe((ship: MTShipData | null) => {
      this.selectedShip = ship;
      console.log('selectedShip', this.selectedShip);
    });
  }

  ngOnChanges(changes: any): void {
    if (changes.toggled) {
      this.isExpanded = changes.toggled.currentValue;
    }
  }

  public getShipCountry(ship: MTShipData) {
    const prefix = +`${ship.shiP_ID}`.substring(0, 3);
    console.log(prefix);
    return isNaN(prefix) ? '' : midCountryMap[prefix];
  }

  public getShipType(ship: MTShipData) {
    if (!ship.shiptype) {
      return 'Unknown';
    }
    return ShipTypes[+ship.shiptype] ?? 'Unknown';
  }
}

import { Component, HostBinding, inject, Input } from '@angular/core';
import { Store } from '../../services/store';
import { MapShipPoint } from '../../models/map-ship-point.model';
import { FocusedShipPoint } from '../../models/focused-ship-point.model';

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

  protected selectedShip: FocusedShipPoint | null = null;
  protected isExpanded = false;

  ngOnInit(): void {
    this.store.focusedShip$.subscribe((ship: FocusedShipPoint | null) => {
      this.selectedShip = ship;
      console.log('selectedShip', this.selectedShip);
    });
  }

  ngOnChanges(changes: any): void {
    if (changes.toggled) {
      this.isExpanded = changes.toggled.currentValue;
    }
  }

  public getShipCountry(ship: FocusedShipPoint) {
    return +`${ship.mmsi}`.substring(0, 3);
  }
}

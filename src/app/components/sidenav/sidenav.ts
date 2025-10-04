import { Component, HostBinding, inject, OnInit, ViewChild } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { Navigation } from '../../services/navigation';
import { MatIconModule } from '@angular/material/icon';
import { UpperCasePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-sidenav',
  imports: [
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatIconModule,
    UpperCasePipe,
    MatMenuModule,
  ],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav implements OnInit {
  @ViewChild('sidenav') sidenav: any;

  @HostBinding('class.is-expanded') get isExpandedClass(): boolean {
    return this.isExpanded;
  }

  protected navigation = inject(Navigation);

  protected clickRoute: string = '';
  protected isExpanded = false;

  protected menuOptions = [
    {
      icon: 'map_search',
      label: 'map',
      route: '/map',
      symbols: true,
    },
  ];

  ngOnInit(): void {}

  public isSelected(route: string): boolean {
    if (route === '/add') {
      return window.location.href.includes(route);
    }
    return route === window.location.pathname;
  }
}

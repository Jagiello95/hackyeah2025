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
      icon: 'dashboard',
      label: 'dashboard',
      route: '/',
    },
    {
      icon: 'map_search',
      label: 'map',
      route: '/map',
      symbols: true,
    },
  ];

  ngOnInit(): void {
    this.navigation.menuToggle$.subscribe((val: boolean) => {
      console.log(2);
      this.isExpanded = val;
    });
  }
  public isSelected(route: string): boolean {
    if (route === '/add') {
      return window.location.href.includes(route);
    }
    return route === window.location.pathname;
  }

  public onMenuClick(): void {
    this.navigation.menuToggle$.next(!this.navigation.menuToggle$.value);
  }

  public redirect(path: string, logout = false): void {
    this.clickRoute = path;
    setTimeout(() => {
      this.clickRoute = '';
    }, 1000);
    this.navigation.redirect$.next(path);
  }
}

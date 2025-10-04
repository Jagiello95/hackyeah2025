import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Navigation {
  public menuToggle$ = new BehaviorSubject(false);
  public sidebarToggle$ = new BehaviorSubject(false);
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public findOnMap$ = new BehaviorSubject<any>(null);
  public redirect$ = new Subject<string>();
}

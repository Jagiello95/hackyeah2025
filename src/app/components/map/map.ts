import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Navigation } from '../../services/navigation';
import { BehaviorSubject } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-map',
  imports: [ReactiveFormsModule, MatSlideToggle, MatButtonModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  protected nav = inject(Navigation);
  protected toggle$ = new BehaviorSubject(false);
}

import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef } from '@angular/core';
import VanillaTilt from 'vanilla-tilt';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {

  constructor(private el: ElementRef) {}
  ngOnInit() {
    VanillaTilt.init(this.el.nativeElement.querySelectorAll('.croissant'), {
      max: 40,
      speed: 300,
      scale: 1.1,
    });
  }
  
}

import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGooglePlus,
  faTwitter,
  faInstagram,
  faFacebookF,
} from '@fortawesome/free-brands-svg-icons';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  facebook_icon = faFacebookF;
  instagram_icon = faInstagram;
  twitter_icon = faTwitter;
  google_icon = faGooglePlus;
  faAngleRight = faAngleRight
}

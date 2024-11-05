import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRightFromBracket, faArrowRightToBracket, faCartShopping, faUser } from '@fortawesome/free-solid-svg-icons'
import { AuthService } from '../../services/Auth/auth.service';
import { PaymentService } from '../../services/Payments/payment.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, FontAwesomeModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  cart_icon = faCartShopping
  faArrowRightFromBracket = faArrowRightFromBracket
  faArrowRightToBracket =faArrowRightToBracket
  cartItemCount: number = 0;
  isLoggedIn$: Observable<boolean>;

  ngOnInit(): void {
    
    this.paymentService.cartCount$.subscribe({
      next: (count) => {
        this.cartItemCount = count;
      }
    });
    
  }

  
  constructor(private auth: AuthService, @Inject(PLATFORM_ID) private platformId: Object, private paymentService: PaymentService) {
    this.isLoggedIn$ = this.auth.isLoggedIn$;

  }

  logOut(){
    console.log("logout");
    
    this.auth.logout().subscribe({
      next:(res)=>{
        console.log(res);
        
      }
    })
  }


}

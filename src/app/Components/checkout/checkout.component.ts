import { Component, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faCheck, faMinus, faShippingFast, faXmark } from '@fortawesome/free-solid-svg-icons';
import { PaymentService } from '../../services/Payments/payment.service';
import { Item } from '../../interfaces/item';



declare let $: any

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  emailForm: FormGroup
  shipForm: FormGroup
  cartItems: Item[] = [];
  orderObject: any = {}
  firstField = true
  seconedField = true
  faMinus = faMinus
  faCheck = faCheck
  faShippingFast = faShippingFast
  canDownload = true;
  isLoading = false;
  isProcessing = false;
  isSuccess = false;
  isDownloadActive = false;
  paymentURL = "";
  apiResponseComplete = false;
  timeoutsComplete = false;

  constructor(private router: Router, private renderer: Renderer2, private paymentService: PaymentService) {
    this.emailForm = new FormGroup({
      email: new FormControl("", [Validators.email, Validators.required]),
    })
    this.shipForm = new FormGroup({
      firstName: new FormControl("", [Validators.required]),
      lastName: new FormControl("", [Validators.required]),
      address: new FormControl("", [Validators.required]),
      phoneNumber: new FormControl("", [Validators.required])
    })
  }
  ngOnInit() {
    this.paymentService.getCartItemsObservable().subscribe({
      next: (items) => {
        if (items.length > 0) {
          this.cartItems = items;
          console.log(items);
        }
        else {
          this.cartItems = this.paymentService.getStoredCartItems()
          console.log(this.cartItems);
        }
      }
    });
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
  }

  getEmail(e: any) {
    e.preventDefault();
    $('.cust').addClass('visible')
    $('.ship').removeClass('visible')
    this.firstField = false
    this.seconedField = true
    console.log(this.emailForm.value);

  }
  closeFirstField() {
    $('.cust').removeClass('visible')
    $('.ship').addClass('visible')
    $('.bill').addClass('visible')
    this.firstField = true
  }
  closeSeconedField() {
    $('.ship').removeClass('visible')
    $('.bill').addClass('visible')
    this.seconedField = true
  }

  calculatePrice() {
    if (!this.cartItems || this.cartItems.length === 0) return 0;
    return this.cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  onSubmit(e: any) {
    e.preventDefault();
    $('.ship').addClass('visible')
    $('.bill').removeClass('visible')
    this.seconedField = false
    this.orderObject = {
      email: this.emailForm.value.email,
      firstName: this.shipForm.value.firstName,
      lastName: this.shipForm.value.lastName,
      phoneNumber: this.shipForm.value.phoneNumber,
      address: this.shipForm.value.address,
    }
    this.billing(this.orderObject)

  }


  billing(custInfo: any) {
    let paymentData = {
      displayName: custInfo.firstName + custInfo.lastName,
      phone: custInfo.phoneNumber,
      address: custInfo.address,
      paymentMethod: "Visa",
      items: this.cartItems
    }
    return paymentData

  }
  BuyStripe() {
    let Obj = this.billing(this.orderObject)
    this.paymentService.createOrder(Obj).subscribe({
      next: (res) => {
        console.log(res);
        this.paymentURL = res.url
        this.apiResponseComplete = true; // Mark the API response as complete
        this.checkAndNavigateToPaymentURL(); // Check if both conditions are met for navigation
      }
    })

    if (this.canDownload) {
      this.isLoading = true;

      setTimeout(() => {
        this.isProcessing = true;
        this.canDownload = false;

        setTimeout(() => {
          this.isProcessing = false;
          this.isLoading = false;
          this.isSuccess = true;

          setTimeout(() => {
            this.isDownloadActive = true;
            this.setThemeColor('#21d49a');
            this.timeoutsComplete = true; // Mark the timeouts as complete
            this.checkAndNavigateToPaymentURL(); // Check if both conditions are met for navigation
          }, 1000);
        }, 2800);
      }, 300);
    }
  }
  setThemeColor(color: string) {
    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag) {
      metaTag.setAttribute('content', color);
    }
    const buyButton = document.querySelector('.buy');
    if (buyButton) {
      (buyButton as HTMLElement).style.backgroundColor = color;
    }
  }

  // Function to check if both API response and timeouts are complete
  checkAndNavigateToPaymentURL = () => {
    if (this.apiResponseComplete && this.timeoutsComplete && this.paymentURL) {
      window.location.href = this.paymentURL; // Navigate to the payment URL
    }
  };

}


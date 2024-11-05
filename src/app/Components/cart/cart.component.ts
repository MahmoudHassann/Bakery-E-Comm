import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../services/Payments/payment.service';
import { Item } from '../../interfaces/item';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { CartItems } from '../../interfaces/cart-items';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {

  cartItems: Item[] = []
  updateditems: any[] = []
  totalPrice: Number = 0
  faXmark = faXmark
  ngOnInit(): void {
    this.getCartItems()
  }

  constructor(private paymentService: PaymentService) {
    console.log(this.updateditems);

  }

  getCartItems() {
    this.paymentService.getCartItems().subscribe({
      next: (res: any) => {
        this.cartItems = res.cart.items
        this.paymentService.cartItems.next(res.cart.items)
        this.paymentService.storeCartItems(res.cart.items)
        console.log(this.cartItems);

        this.totalPrice = res.cart.bill
      },
      error: (err) => {
        console.log('Fetch Error', err);
      }
    })
  }


  increaseQuantity(item: Item) {
    item.quantity++; // Increase the quantity of the item
    this.paymentService.incrementCartCount(1)
    const existingItemIndex = this.updateditems.findIndex(updatedItem => updatedItem.itemId === item.itemId._id);

    if (existingItemIndex === -1) {
      // If the item does not exist in updateditems, add it with a positive quantity
      this.updateditems.push({ itemId: item.itemId._id, quantity: 1 });
    } else {
      // If the item exists, increment its quantity by 1
      this.updateditems[existingItemIndex].quantity += 1;
    }
    this.cleanUpdatedItems();
    console.log(this.updateditems);
  }

  decreaseQuantity(item: Item) {
    if (item.quantity > 1) {
      item.quantity--; // Decrease the quantity of the item
      this.paymentService.decrementCartCount(1)
      const existingItemIndex = this.updateditems.findIndex(updatedItem => updatedItem.itemId === item.itemId._id);

      if (existingItemIndex === -1) {
        // If the item does not exist in updateditems, add it with a negative quantity
        this.updateditems.push({ itemId: item.itemId._id, quantity: -1 });
      } else {
        // If the item exists, decrement its quantity by 1
        this.updateditems[existingItemIndex].quantity -= 1;
      }
    }
    this.cleanUpdatedItems();
    console.log(this.updateditems);
  }
  // Remove items with a quantity difference of 0 from the updateditems array
  cleanUpdatedItems() {
    this.updateditems = this.updateditems.filter(updatedItem => updatedItem.quantity !== 0);
  }

  removeCartItem(itemID:string){
    this.paymentService.removeCartItem(itemID).subscribe({
      next:(res)=>{
        this.getCartItems()
        
      }
    })
  }

  updateCart() {
    let requestData = { items: this.updateditems }
    console.log("updateCart", requestData);

    this.paymentService.addCart(requestData).subscribe({
      next: (res: any) => {
        this.updateditems = []
        this.getCartItems()
      },
      error: (err) => {
        console.log('Fetch Error', err);
      }
    })
  }
}

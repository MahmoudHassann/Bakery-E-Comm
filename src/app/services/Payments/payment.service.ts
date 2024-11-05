import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItems } from '../../interfaces/cart-items';
import { Cart } from '../../interfaces/cart';
import { Item } from '../../interfaces/item';

const BASE_URL = environment.Base_Url

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private cartChannel = new BroadcastChannel('cart_channel');
  public cartItems = new BehaviorSubject<Item[]>([]); // To store cart items
  public cartCount = new BehaviorSubject<number>(this.getStoredCartCount()); // Initialize with stored count or 0
  cartCount$ = this.cartCount.asObservable(); // Observable to allow components to subscribe

  constructor(private Http: HttpClient, private ngZone: NgZone) {
    this.cartChannel.onmessage = (event) => {
      if (event.data.type === 'cart_update') {
        this.ngZone.run(() => {
          this.syncCartFromStorage();
        })
      }
    };
  }

  private syncCartFromStorage() {
    this.cartItems.next(this.getStoredCartItems());
    this.cartCount.next(this.getStoredCartCount());
  }

  // Store cart count in localStorage
  storeCartCount(count: number) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('cartCount', count.toString());
    }
    this.cartChannel.postMessage({ type: 'cart_update' });
  }

  // Retrieve stored cart count from localStorage
  getStoredCartCount(): number {
    if (typeof window !== 'undefined' && window.localStorage) {
      const count = localStorage.getItem('cartCount');
      return count ? parseInt(count, 10) : 0; // Default to 0 if no stored value
    }
    return 0; // Default to 0 if localStorage is unavailable
  }
  getStoredCartItems() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedItems = localStorage.getItem('cartItems');
      return storedItems ? JSON.parse(storedItems) : [];
    }
  }

  // Increment cart count and store it
  incrementCartCount(quantity: number) {
    const currentCount = this.cartCount.getValue();
    const newCount = currentCount + quantity;
    this.cartCount.next(newCount); // Increment cart count
    this.storeCartCount(newCount); // Store the updated count in localStorage
    console.log(this.cartCount.getValue());
  }

  // Decrement cart count and store it, ensuring it doesn't go below 0
  decrementCartCount(quantity: number) {
    const currentCount = this.cartCount.getValue();
    const newCount = Math.max(currentCount - quantity, 0);
    this.cartCount.next(newCount);
    this.storeCartCount(newCount); // Store the updated count in localStorage
  }

  // Sync cart count after successful login
  syncCartCountAfterLogin() {
    // Check if cart count exists in localStorage
    const storedCartCount = this.getStoredCartCount();

    if (storedCartCount > 0) {
      // If cart count is available in localStorage, update the cart count in service
      this.cartCount.next(storedCartCount);
    } else {
      // Fetch cart items from the server if count is not available in localStorage
      // Assuming the response structure from the API is already checked
      this.getCartItems().subscribe({
        next: (res: any) => {
          if (res.cart && Array.isArray(res.cart.items)) {
            const totalQuantity = res.cart.items.reduce((sum: number, item: Item) => {
              return sum + (item.quantity || 0); // Use 0 if quantity is undefined
            }, 0);
            this.cartCount.next(totalQuantity);
            this.cartItems.next(res.cart.items);
            this.storeCartCount(totalQuantity);
            this.storeCartItems(res.cart.items);
          } else {
            console.error('Cart or items is not an array', res);
          }
        },
        error: (err) => {
          console.error('Error fetching cart items:', err);
        }
      });

    }
  }
  // Store cart items in localStorage
  storeCartItems(items: Item[]) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('cartItems', JSON.stringify(items));
      this.cartChannel.postMessage({ type: 'cart_update' });
    }
  }
  // Method to get the cart items
  getCartItemsObservable(): Observable<Item[]> {
    return this.cartItems.asObservable();
  }

  // Fetch cart items from the backend
  getCartItems(): Observable<Cart> {
    return this.Http.get<Cart>(`${BASE_URL}cart`);
  }

  addCart(data: any): Observable<CartItems> {
    return this.Http.post<CartItems>(`${BASE_URL}cart`, data).pipe(
      tap(() => this.cartChannel.postMessage({ type: 'cart_update' }))
    );
  }

  removeCartItem(itemId: any): Observable<any> {
    return this.Http.delete(`${BASE_URL}cart?itemID=${itemId}`).pipe(
      tap(() => this.cartChannel.postMessage({ type: 'cart_update' }))
    );
  }

  createOrder(data: any): Observable<any> {
    return this.Http.post(`${BASE_URL}order`, data)
  }

}

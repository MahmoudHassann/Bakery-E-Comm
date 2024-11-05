import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { PaymentService } from '../Payments/payment.service';

const BASE_URL = environment.Base_Url;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessTokenKey = 'accessToken';
  public platformId: Object;
  private broadcastChannel: BroadcastChannel;
  private isLoggingOut = false; // Flag to track if logout is in progress
  private loggedInSubject = new BehaviorSubject<boolean>(this.getAccessToken() !== null);

  // Observable to subscribe to authentication state changes
  public isLoggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) platformId: Object, private ngZone: NgZone,private paymentService:PaymentService) {
    this.broadcastChannel = new BroadcastChannel('auth_channel');
    this.platformId = platformId;

    // Listen for login/logout events from other tabs
    this.listenForMessages();

    if (this.getAccessToken()) {
      this.loggedInSubject.next(true);
    } else {
      this.loggedInSubject.next(false);
    }
  }
  private listenForMessages() {
    this.broadcastChannel.onmessage = (message) => {
      if (message.data.action === 'logout') {
        this.ngZone.run(() => {
          this.clearStorage();
          this.router.navigate(['/auth']);
        })
      }
      else {
        this.ngZone.run(() => {

          this.router.navigate(['/home']);
        })
      }
    };
  }

  login(data: any): Observable<any> {
    this.loggedInSubject.next(true);
    return this.http.post(`${BASE_URL}auth/signin`, data);
  }

  // Store only the access token in local storage
  storeAccessToken(accessToken: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.accessTokenKey, accessToken);
      const channel = new BroadcastChannel('auth_channel');
      channel.postMessage({ action: 'login' }); // This sends the logout message
    }
  }

  getAccessToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(this.accessTokenKey) : null;
  }

  isTokenExpired(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);
      const expirationDate = decodedToken.exp * 1000;
      return expirationDate < Date.now();
    } catch (error) {
      return true;
    }
  }

  clearStorage() {
    localStorage.clear();

  }

  logout(): Observable<any> {
    this.isLoggingOut = true; // Set flag to prevent further refresh attempts
    this.loggedInSubject.next(false);
    return this.http.post(`${BASE_URL}auth/logout`, {}).pipe(
      tap(() => {
        const channel = new BroadcastChannel('auth_channel');
        channel.postMessage({ action: 'logout' }); // This sends the logout message
        this.clearStorage();
        const count = this.paymentService.getStoredCartCount()
        this.paymentService.cartCount.next(count)
        this.paymentService.cartCount$.subscribe({
          next:(res)=>{
            console.log(res);
          }
        })
        this.router.navigate(['/auth']);
        this.isLoggingOut = false; // Reset flag after logout completes
      }),
      catchError(err => {
        console.error('Logout failed', err);
        this.isLoggingOut = false; // Reset flag in case of error
        return throwError(() => err);
      })
    );
  }

  getLogoutStatus(): boolean {
    return this.isLoggingOut;
  }

  // Refresh access token by calling the server without a refresh token payload
  refreshAccessToken(): Observable<any> {
    return this.http.post(`${BASE_URL}auth/refresh-token`, {}).pipe(
      tap((response: any) => {
        this.storeAccessToken(response.accessToken);
      }),
      catchError(error => {
        this.logout();
        console.error('Refresh token failed', error);
        return throwError(() => error);
      })
    );
  }
}

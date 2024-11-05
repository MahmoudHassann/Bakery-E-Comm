import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { ProductComponent } from './Components/product/product.component';
import { ShopComponent } from './Components/shop/shop.component';
import { CartComponent } from './Components/cart/cart.component';
import { CheckoutComponent } from './Components/checkout/checkout.component';
import { AuthComponent } from './Components/auth/auth.component';
import { authGuard } from './Auth/auth.guard';
import { ContactComponent } from './Components/contact/contact.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: AuthComponent,canActivate: [authGuard]
  },
  {
    path: 'home',
    component: HomeComponent,canActivate: [authGuard]
  },
  {
    path: 'menu',
    component: ShopComponent,canActivate: [authGuard]
  },
  {
    path: 'product/:id',
    component: ProductComponent,canActivate: [authGuard]
  },
  {
    path: 'cart',
    component: CartComponent,canActivate: [authGuard]
  },
  {
    path: 'checkout',
    component: CheckoutComponent,canActivate: [authGuard]
  },
  {
    path: 'contacts',
    component: ContactComponent,canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

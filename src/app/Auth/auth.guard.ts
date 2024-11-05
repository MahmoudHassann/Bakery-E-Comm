import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';
import { inject } from '@angular/core';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const accessToken = authService.getAccessToken();
  const isAuthenticated = accessToken && !authService.isTokenExpired(accessToken);

  if (authService.getLogoutStatus()) return of(false); // Skip if logout is in progress

  if (route.routeConfig?.path === 'auth') {
    if (!isAuthenticated) return true;
    router.navigate(['/home']);
    return false;
  }

  // Restrict access to checkout for authenticated users only
  if (route.routeConfig?.path === 'order' || route.routeConfig?.path === 'cart' ) {
    if (isAuthenticated) return true;

    // Redirect to login with redirect URL if not authenticated
    const redirectUrl = state.url;
    router.navigate(['/auth'], { queryParams: { redirectTo: redirectUrl } });
    return false;
  }
  // Allow access to all other pages without authentication
  return true;

};

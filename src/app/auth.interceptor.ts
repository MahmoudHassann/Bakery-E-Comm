import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './services/Auth/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from './services/loading.service';

let isRefreshing = false; // Flag to track refresh state

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);

  loadingService.show();
  let accessToken = authService.getAccessToken();

  const cloneRequest = req.clone({
    setHeaders: { Authorization: `Bearer ${accessToken}` },
    withCredentials: true
  });

  return next(cloneRequest).pipe(
    catchError(error => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;
        return handleRefreshToken(req, next, authService, router,loadingService).pipe(
          finalize(() => {
            isRefreshing = false; // Reset flag after refreshing
            loadingService.hide();
          })
        )
      } else {
        loadingService.hide();
        return throwError(() => error);
      }
    }), finalize(() => {
      loadingService.hide();
    })
  );
};

function handleRefreshToken(req: any, next: any, authService: AuthService, router: Router,loadingService: LoadingService): Observable<any> {
  return authService.refreshAccessToken().pipe(
    switchMap(tokens => {
      const newAuthReq = req.clone({
        setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
        withCredentials: true
      });
      return next(newAuthReq);
    }),
    catchError(err => {
      if (err.status === 401 || err.status === 403) {
        authService.logout();
        router.navigate(['/auth']);
      }
      return throwError(() => err);
    }),
    finalize(() => {
      loadingService.hide(); // Ensure loading indicator is hidden after refreshing attempt
    })
  );
}

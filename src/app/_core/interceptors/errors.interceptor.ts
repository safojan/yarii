import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, retry, throwError, timer } from 'rxjs';
import { NOTYF } from '../../shared/utils/notyf.token';
import { Notyf } from 'notyf';
import { IError } from '../../shared/interfaces/error.interface';
import { TokenService } from '../services/token.service';

@Injectable()
export class ErrorsInterceptor implements HttpInterceptor {
  constructor(
    @Inject(NOTYF) private notyf: Notyf,
    private router: Router,
    private tokenService: TokenService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.notyf.dismissAll();

    return next.handle(request).pipe(
      retry({
        count: 3,
        delay: (error: HttpErrorResponse, retryCount) =>
          this.shouldRetry(error, retryCount),
      }),
      catchError((error: HttpErrorResponse) => {
        // Detailed logging
        console.error('HTTP Error:', error);

        let errorMessage = 'The server is not ready to process your request.';

        // Handling different types of errors
        switch (error.status) {
          case 400:
            errorMessage =
              this.extractErrorMessage(error) ||
              'Bad Request. Please check your input.';
            this.notyf.error({
              message: errorMessage,
              duration: 0,
            });
            break;
          case 401:
            errorMessage =
              this.extractErrorMessage(error) ||
              'Unauthorized. Please log in again.';
            this.handleAuthenticationError(errorMessage);
            break;
          case 403:
            errorMessage =
              this.extractErrorMessage(error) ||
              'Forbidden. You do not have the required permissions.';
            this.handleAuthorizationError(errorMessage);
            break;
          case 404:
            errorMessage =
              this.extractErrorMessage(error) ||
              'Not Found. The requested resource does not exist.';
            this.notyf.error({
              message: errorMessage,
              duration: 0,
            });
            break;
          case 500:
            errorMessage =
              this.extractErrorMessage(error) ||
              'Internal Server Error. Please try again later.';
            this.notyf.error({
              message: errorMessage,
              duration: 0,
            });
            break;
          default:
            if (error.status !== 0 && error.error?.title) {
              errorMessage = error.error.title;
            }
            this.notyf.error({
              message: errorMessage,
              duration: 0,
            });
            break;
        }

        // Rethrow with a more informative error message
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private shouldRetry(error: HttpErrorResponse, retryCount: number) {
    if (error.status >= 500 && retryCount < 3) {
      return timer(retryCount * 1000);
    }
    return throwError(() => error);
  }

  private extractErrorMessage(error: HttpErrorResponse): string | null {
    if (Array.isArray(error.error)) {
      const serverError = error.error.find((err: IError) => err.message);
      return serverError ? serverError.message : null;
    }
    return null;
  }

  /**
   * Handle 401 Unauthorized errors
   */
  private handleAuthenticationError(message: string): void {
    console.log('ErrorsInterceptor: Handling 401 authentication error');
    
    // Clear authentication data
    this.tokenService.clearAuthData();
    
    // Show error message
    this.notyf.error({
      message: message,
      duration: 0,
    });
    
    // Redirect to login page
    this.router.navigate(['/signin']);
  }

  /**
   * Handle 403 Forbidden errors
   */
  private handleAuthorizationError(message: string): void {
    console.log('ErrorsInterceptor: Handling 403 authorization error');
    
    // Show error message
    this.notyf.error({
      message: message,
      duration: 0,
    });
    
    // Check if user is authenticated, if not redirect to login
    if (!this.tokenService.isTokenValid()) {
      this.tokenService.clearAuthData();
      this.router.navigate(['/signin']);
    } else {
      // User is authenticated but doesn't have permission
      // Redirect to a safe page or show access denied page
      this.router.navigate(['/signin']); // or create an access-denied page
    }
  }
}

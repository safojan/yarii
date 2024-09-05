import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError, timer } from 'rxjs';
import { NOTYF } from '../../shared/utils/notyf.token';
import { Notyf } from 'notyf';
import { IError } from '../../shared/interfaces/error.interface';

@Injectable()
export class ErrorsInterceptor implements HttpInterceptor {
  constructor(@Inject(NOTYF) private notyf: Notyf) {}

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
            this.notyf.error({
              message: errorMessage,
              duration: 0,
            });
            break;
          case 403:
            errorMessage =
              this.extractErrorMessage(error) ||
              'Forbidden. You do not have the required permissions.';
            this.notyf.error({
              message: errorMessage,
              duration: 0,
            });
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
}

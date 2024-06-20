import { HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { from, lastValueFrom } from 'rxjs';

export const authorizationInterceptor: HttpInterceptorFn = (req, next) => {
  return from(handle(req, next));
};

const handle = async (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthenticationService);
  const authToken = await authService.getUserIdToken();
  const authReq = req.clone({
    setHeaders: {
      Authorization: `${authToken}`
    }
  });
  return lastValueFrom(next(authReq));
}
import { HttpInterceptorFn } from '@angular/common/http';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({ url: `https://app-mdoldxqroa-uc.a.run.app/${req.url}` });
  return next(apiReq);
};
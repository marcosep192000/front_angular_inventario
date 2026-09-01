import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { finalize } from 'rxjs';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerInterceptor = inject(SpinnerService);
  spinnerInterceptor.show();
  return next(req).pipe(finalize(() => spinnerInterceptor.hide()));
};

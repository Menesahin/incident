import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface WrappedResponse {
  success: boolean;
  data: unknown;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<WrappedResponse> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data
        ) {
          return data as WrappedResponse;
        }
        return { success: true, data };
      }),
    );
  }
}

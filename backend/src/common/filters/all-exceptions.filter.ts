import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'string') {
        message = exResponse;
      } else {
        const res = exResponse as Record<string, unknown>;
        message = (res['message'] as string) ?? message;
        details = res['details'];
      }
    }

    if (status >= 500) {
      this.logger.error(
        `${status} ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${status} ${message}`);
    }

    response.status(status).json({
      success: false,
      data: null,
      error: { code: status, message, ...(details ? { details } : {}) },
    });
  }
}

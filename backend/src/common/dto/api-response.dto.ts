import { PaginationQueryDto } from './pagination-query.dto.js';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApiResponse<T> {
  success: boolean;
  data: T;
  error: { code: number; message: string; details?: unknown } | null;
  meta?: PaginationMeta;

  private constructor(
    success: boolean,
    data: T,
    error: ApiResponse<T>['error'] = null,
    meta?: PaginationMeta,
  ) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.meta = meta;
  }

  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse(true, data);
  }

  static paginated<T>(
    items: T[],
    total: number,
    query: PaginationQueryDto,
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(total / query.limit);
    const meta: PaginationMeta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    };
    return new ApiResponse(true, items, null, meta);
  }

  static error(
    code: number,
    message: string,
    details?: unknown,
  ): ApiResponse<null> {
    return new ApiResponse(false, null, { code, message, details });
  }
}

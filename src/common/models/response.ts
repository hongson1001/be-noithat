import * as moment from 'moment-timezone';

export interface IResponseData<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

class BaseResponseModel {
  readonly statusCode: number;
  readonly message: string;
  readonly timestamp: string;

  constructor(
    statusCode: number,
    message: string,
    timeZone: string = 'Asia/Ho_Chi_Minh',
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.timestamp = moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
  }
}

export class PaginationSet<T> {
  readonly page: number;
  readonly limit: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly data: T[];

  constructor(page: number, limit: number, totalItems: number, data: T[]) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 1;
    this.hasNextPage = this.totalPages > 1 && page < this.totalPages;
    this.hasPreviousPage = page > 1;
    this.data = data;
  }
}

export class ResponseContentModel<T> extends BaseResponseModel {
  readonly data: T | T[] | PaginationSet<T> | null;

  constructor(
    statusCode: number,
    message: string,
    data: T | T[] | PaginationSet<T> | null,
    timestamp?: string,
  ) {
    super(statusCode, message, timestamp);
    this.data = data;
  }
}

export class ErrorResponseModel<
  T = string[] | Record<string, any>,
> extends BaseResponseModel {
  readonly errors: T;

  constructor(
    statusCode: number,
    message: string,
    errors: T,
    timestamp?: string,
  ) {
    super(statusCode, message, timestamp);
    this.errors = errors;
  }
}

export class ResponseDto<T = unknown> {
  errorCode: string;
  successful: boolean;
  message: string;
  totalRecords?: number;
  data?: T;
  httpStatus?: number;
}

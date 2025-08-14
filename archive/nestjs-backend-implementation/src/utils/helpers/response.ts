import { ERROR_CODES } from 'src/common/constants';
import { FindAndCountDto, ResponseDto } from 'src/common/dtos';

export const getResponseStatus = <T>(
  errorCode: string,
  data?: T,
  message: string | string[] = '',
  httpStatus?: number,
): ResponseDto<T> => {
  const error = ERROR_CODES.find(item => item.errorCode === errorCode);

  let totalRecords: number | undefined;

  if (data && typeof data === 'object' && 'count' in data && 'rows' in data) {
    totalRecords = (data as FindAndCountDto).count;
    data = (data as FindAndCountDto).rows as T;
  }

  if (!error) {
    return {
      errorCode: 'Unknown',
      successful: false,
      message: 'Unknown error code',
      httpStatus: httpStatus || 500,
      ...(totalRecords !== undefined ? { totalRecords } : {}),
      ...(data ? { data } : {}),
    } as ResponseDto<T>;
  }

  return {
    ...error,
    message: message.length ? message : error.message,
    httpStatus: httpStatus || error.httpStatus,
    ...(totalRecords !== undefined ? { totalRecords } : {}),
    ...(data ? { data } : {}),
  } as ResponseDto<T>;
};

import { ResponseDto } from '../dtos';

export const ERROR_CODES: ResponseDto[] = [
  {
    errorCode: 'SUCCESS',
    message: 'The request was successful.',
    successful: true,
    httpStatus: 200,
  },
  {
    errorCode: 'CREATED',
    message: 'The resource was created successfully.',
    successful: true,
    httpStatus: 201,
  },
  {
    errorCode: 'ACCEPTED',
    message: 'The request has been accepted for processing.',
    successful: true,
    httpStatus: 202,
  },
  {
    errorCode: 'NON_AUTHORITATIVE_INFORMATION',
    message:
      'The request was successful, but the information may be from a third-party source.',
    successful: true,
    httpStatus: 203,
  },
  {
    errorCode: 'NO_CONTENT',
    message: 'The request was successful, but there is no content to return.',
    successful: true,
    httpStatus: 204,
  },
  {
    errorCode: 'RESET_CONTENT',
    message: 'The request was successful. Please reset the content.',
    successful: true,
    httpStatus: 205,
  },
  {
    errorCode: 'PARTIAL_CONTENT',
    message:
      'The request was successful, and only partial content is returned.',
    successful: true,
    httpStatus: 206,
  },
  {
    errorCode: 'MULTI_STATUS',
    message: 'The request was successful, and multiple statuses are returned.',
    successful: true,
    httpStatus: 207,
  },
  {
    errorCode: 'ALREADY_REPORTED',
    message: 'The resource has already been reported.',
    successful: true,
    httpStatus: 208,
  },
  {
    errorCode: 'IM_USED',
    message:
      'The request was successful, and the resource has been transformed.',
    successful: true,
    httpStatus: 226,
  },
  {
    errorCode: 'ERR_BAD_REQUEST',
    message:
      'The server could not understand the request due to invalid syntax.',
    successful: false,
    httpStatus: 400,
  },
  {
    errorCode: 'ERR_UNAUTHORIZED',
    message: 'You must be authenticated to access this resource.',
    successful: false,
    httpStatus: 401,
  },
  {
    errorCode: 'ERR_FORBIDDEN',
    message: 'You do not have permission to access this resource.',
    successful: false,
    httpStatus: 403,
  },
  {
    errorCode: 'ERR_NOT_FOUND',
    message: 'The requested resource could not be found.',
    successful: false,
    httpStatus: 404,
  },
  {
    errorCode: 'ERR_METHOD_NOT_ALLOWED',
    message: 'The HTTP method used is not allowed for this resource.',
    successful: false,
    httpStatus: 405,
  },
  {
    errorCode: 'ERR_NOT_ACCEPTABLE',
    message:
      'The requested resource is not acceptable according to the Accept headers sent in the request.',
    successful: false,
    httpStatus: 406,
  },
  {
    errorCode: 'ERR_REQUEST_TIMEOUT',
    message: 'The server timed out waiting for the request.',
    successful: false,
    httpStatus: 408,
  },
  {
    errorCode: 'ERR_CONFLICT',
    message:
      'The request could not be completed due to a conflict with the current state of the resource.',
    successful: false,
    httpStatus: 409,
  },
  {
    errorCode: 'ERR_GONE',
    message:
      'The requested resource is no longer available and will not be available again.',
    successful: false,
    httpStatus: 410,
  },
  {
    errorCode: 'ERR_PRECONDITION_FAILED',
    message:
      'The server does not meet one of the preconditions specified in the request.',
    successful: false,
    httpStatus: 412,
  },
  {
    errorCode: 'ERR_PAYLOAD_TOO_LARGE',
    message: 'The request payload is too large.',
    successful: false,
    httpStatus: 413,
  },
  {
    errorCode: 'ERR_UNSUPPORTED_MEDIA_TYPE',
    message: 'The media type of the request is not supported by the server.',
    successful: false,
    httpStatus: 415,
  },
  {
    errorCode: 'ERR_IM_A_TEAPOT',
    message: 'The server refuses to brew coffee because it is a teapot.',
    successful: false,
    httpStatus: 418,
  },
  {
    errorCode: 'ERR_UNPROCESSABLE_ENTITY',
    message:
      'The server understands the request but cannot process it due to semantic errors.',
    successful: false,
    httpStatus: 422,
  },
  {
    errorCode: 'ERR_EXTERNAL_SERVICE',
    message: 'An error occurred while communicating with an external service.',
    successful: false,
    httpStatus: 424,
  },
  {
    errorCode: 'ERR_TOO_MANY_REQUESTS',
    message:
      'You have sent too many requests in a given amount of time. Please try again later.',
    successful: false,
    httpStatus: 429,
  },
  {
    errorCode: 'ERR_CLIENT_CLOSED_REQUEST',
    message: 'The client closed the request before the server could respond.',
    successful: false,
    httpStatus: 499,
  },
  {
    errorCode: 'ERR_INTERNAL_SERVER_ERROR',
    message: 'An internal server error occurred. Please try again later.',
    successful: false,
    httpStatus: 500,
  },
  {
    errorCode: 'ERR_NOT_IMPLEMENTED',
    message:
      'The server does not support the functionality required to fulfill the request.',
    successful: false,
    httpStatus: 501,
  },
  {
    errorCode: 'ERR_BAD_GATEWAY',
    message: 'The server received an invalid response from an upstream server.',
    successful: false,
    httpStatus: 502,
  },
  {
    errorCode: 'ERR_SERVICE_UNAVAILABLE',
    message:
      'The server is currently unable to handle the request due to temporary overload or maintenance.',
    successful: false,
    httpStatus: 503,
  },
  {
    errorCode: 'ERR_GATEWAY_TIMEOUT',
    message:
      'The server did not receive a timely response from an upstream server.',
    successful: false,
    httpStatus: 504,
  },
  {
    errorCode: 'ERR_HTTP_VERSION_NOT_SUPPORTED',
    message:
      'The server does not support the HTTP protocol version used in the request.',
    successful: false,
    httpStatus: 505,
  },
];

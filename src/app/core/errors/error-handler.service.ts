import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface AppError {
  title: string;
  message: string;
  status: number;
}

const ERROR_MAP: Record<number, AppError> = {
  400: {
    title: 'Invalid Request',
    message: 'The information provided is not valid. Please check and try again.',
    status: 400,
  },
  401: {
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    status: 401,
  },
  403: {
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
    status: 403,
  },
  404: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    status: 404,
  },
  409: {
    title: 'Conflict',
    message: 'This action conflicts with an existing resource.',
    status: 409,
  },
  422: {
    title: 'Validation Error',
    message: 'Some fields contain invalid data. Please review and try again.',
    status: 422,
  },
  429: {
    title: 'Too Many Requests',
    message: 'You have made too many requests. Please wait a moment and try again.',
    status: 429,
  },
  500: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    status: 500,
  },
};

const UNKNOWN_ERROR: AppError = {
  title: 'Unexpected Error',
  message: 'An unexpected error occurred. Please try again.',
  status: 0,
};

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  mapHttpError(error: HttpErrorResponse): AppError {
    const serverMessage = this.extractServerMessage(error);
    const mapped = ERROR_MAP[error.status] ?? { ...UNKNOWN_ERROR, status: error.status };

    if (serverMessage && error.status !== 500) {
      return { ...mapped, message: serverMessage };
    }

    return mapped;
  }

  private extractServerMessage(error: HttpErrorResponse): string | null {
    const body = error.error;
    if (!body || typeof body !== 'object') {
      return null;
    }

    return body['message'] ?? body['error'] ?? null;
  }
}

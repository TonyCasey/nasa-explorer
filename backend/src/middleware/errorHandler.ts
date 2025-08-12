import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error
  console.error(`❌ Error ${statusCode}: ${err.message}`);
  if (!isProduction) {
    console.error(err.stack);
  }

  // Prepare error response
  const errorResponse: any = {
    error: true,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Add stack trace in development
  if (!isProduction) {
    errorResponse.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.message = 'Validation Error';
    errorResponse.details = err.message;
  } else if (err.name === 'CastError') {
    errorResponse.message = 'Invalid ID format';
  } else if (statusCode === 404) {
    errorResponse.message = 'Resource not found';
  } else if (statusCode === 429) {
    errorResponse.message = 'Too many requests, please try again later';
  }

  res.status(statusCode).json(errorResponse);
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
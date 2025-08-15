import { Request, Response, NextFunction } from 'express';
import { errorHandler, createError } from './errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/test',
      method: 'GET',
    };

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
    };

    mockNext = jest.fn();

    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle basic errors with default status code', () => {
    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: true,
      message: 'Test error',
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
      stack: expect.any(String),
    });
  });

  it('should handle errors with custom status codes', () => {
    const error = createError('Custom error', 400);

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: true,
      message: 'Custom error',
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
      stack: expect.any(String),
    });
  });

  it('should handle 404 errors with custom message', () => {
    const error = createError('Not found', 404);

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: true,
      message: 'Resource not found',
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
      stack: expect.any(String),
    });
  });

  it('should handle 429 rate limit errors', () => {
    const error = createError('Rate limited', 429);

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(429);
    expect(jsonMock).toHaveBeenCalledWith({
      error: true,
      message: 'Too many requests, please try again later',
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
      stack: expect.any(String),
    });
  });

  it('should exclude stack trace in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(jsonMock).toHaveBeenCalledWith({
      error: true,
      message: 'Test error',
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
    });

    process.env.NODE_ENV = originalEnv;
  });
});

describe('createError function', () => {
  it('should create error with default status code', () => {
    const error = createError('Test message');

    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('should create error with custom status code', () => {
    const error = createError('Test message', 400);

    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });
});
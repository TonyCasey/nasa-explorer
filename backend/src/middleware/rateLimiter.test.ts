import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from './rateLimiter';

describe('Rate Limiter Middleware - Simple Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
      method: 'GET',
      originalUrl: '/test',
    };

    mockResponse = {
      status: jest.fn().mockReturnValue({ json: jest.fn() }),
      json: jest.fn(),
      set: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should call next() for allowed requests', () => {
    rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.set).toHaveBeenCalledWith(expect.objectContaining({
      'X-RateLimit-Limit': expect.any(String),
      'X-RateLimit-Remaining': expect.any(String),
      'X-RateLimit-Reset': expect.any(String),
    }));
  });

  it('should handle missing IP gracefully', () => {
    (mockRequest as any).ip = undefined;
    
    rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set rate limit headers', () => {
    rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
    
    expect(mockResponse.set).toHaveBeenCalled();
  });

  it('should work with different IP addresses', () => {
    const firstRequest = { ...mockRequest, ip: '127.0.0.1' };
    const secondRequest = { ...mockRequest, ip: '192.168.1.1' };
    
    const firstNext = jest.fn();
    const secondNext = jest.fn();
    
    rateLimiter(firstRequest as Request, mockResponse as Response, firstNext);
    rateLimiter(secondRequest as Request, mockResponse as Response, secondNext);
    
    expect(firstNext).toHaveBeenCalled();
    expect(secondNext).toHaveBeenCalled();
  });

  it('should handle environment variables', () => {
    const originalMax = process.env.RATE_LIMIT_MAX_REQUESTS;
    const originalWindow = process.env.RATE_LIMIT_WINDOW_MS;
    
    process.env.RATE_LIMIT_MAX_REQUESTS = '50';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    
    try {
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith(expect.objectContaining({
        'X-RateLimit-Limit': '50'
      }));
    } finally {
      process.env.RATE_LIMIT_MAX_REQUESTS = originalMax;
      process.env.RATE_LIMIT_WINDOW_MS = originalWindow;
    }
  });
});
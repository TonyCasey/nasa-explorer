import { Request, Response, NextFunction } from 'express';
import { cacheMiddleware, clearCache } from './cache';

describe('Cache Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
      query: {},
    };

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    setHeaderMock = jest.fn();

    mockResponse = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
      set: jest.fn(),
      statusCode: 200,
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    clearCache();
  });

  it('caches GET responses', async () => {
    // First request
    cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();

    // Simulate response with 200 status
    mockResponse.statusCode = 200;
    const originalJson = mockResponse.json;
    const testData = { message: 'test data' };
    
    if (originalJson) {
      originalJson(testData);
    }

    // Second request to same URL
    const secondResponse = {
      ...mockResponse,
      json: jest.fn(),
      setHeader: jest.fn(),
      set: jest.fn(),
    };

    cacheMiddleware(mockRequest as Request, secondResponse as Response, jest.fn());

    expect(secondResponse.json).toHaveBeenCalledWith(testData);
    expect(secondResponse.set).toHaveBeenCalledWith(expect.objectContaining({ 'X-Cache': 'HIT' }));
  });

  it('does not cache non-GET requests', () => {
    mockRequest.method = 'POST';

    cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(setHeaderMock).not.toHaveBeenCalledWith('X-Cache', 'HIT');
  });

  it('sets cache headers for fresh responses', () => {
    mockResponse.statusCode = 200;
    mockResponse.set = jest.fn();

    cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    // Trigger the overridden json method
    if (mockResponse.json) {
      mockResponse.json({ data: 'test' });
    }

    expect(mockResponse.set).toHaveBeenCalledWith(expect.objectContaining({ 'X-Cache': 'MISS' }));
  });

  it('expires cached responses after TTL', async () => {
    // Mock environment variable for shorter TTL
    const originalTTL = process.env.CACHE_TTL;
    process.env.CACHE_TTL = '1'; // 1 second

    try {
      // First request
      mockResponse.statusCode = 200;
      cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      const originalJson = mockResponse.json;
      if (originalJson) {
        originalJson({ data: 'test' });
      }

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Second request should miss cache
      const secondResponse = {
        ...mockResponse,
        json: jest.fn(),
        set: jest.fn(),
      };
      const secondNext = jest.fn();

      cacheMiddleware(mockRequest as Request, secondResponse as Response, secondNext);

      expect(secondNext).toHaveBeenCalled();
    } finally {
      process.env.CACHE_TTL = originalTTL;
    }
  });

  it('handles different URLs separately', () => {
    // First URL
    mockResponse.statusCode = 200;
    cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    const originalJson = mockResponse.json;
    if (originalJson) {
      originalJson({ data: 'test1' });
    }

    // Different URL
    const secondRequest = { ...mockRequest, originalUrl: '/different' };
    const secondResponse = {
      ...mockResponse,
      json: jest.fn(),
      set: jest.fn(),
    };
    const secondNext = jest.fn();

    cacheMiddleware(secondRequest as Request, secondResponse as Response, secondNext);

    expect(secondNext).toHaveBeenCalled();
  });

  it('includes query parameters in cache key', () => {
    // Request with query params
    mockRequest.query = { param1: 'value1' };
    mockResponse.statusCode = 200;
    
    cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    const originalJson = mockResponse.json;
    if (originalJson) {
      originalJson({ data: 'test' });
    }

    // Same URL but different query params
    const secondRequest = { ...mockRequest, query: { param1: 'value2' } };
    const secondResponse = {
      ...mockResponse,
      json: jest.fn(),
      set: jest.fn(),
    };
    const secondNext = jest.fn();

    cacheMiddleware(secondRequest as Request, secondResponse as Response, secondNext);

    expect(secondNext).toHaveBeenCalled();
  });

  it('clears cache correctly', () => {
    // Cache a response
    mockResponse.statusCode = 200;
    cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    const originalJson = mockResponse.json;
    if (originalJson) {
      originalJson({ data: 'test' });
    }

    // Clear cache
    const cleared = clearCache();
    expect(cleared).toBeGreaterThanOrEqual(0);

    // Request should miss cache
    const secondResponse = {
      ...mockResponse,
      json: jest.fn(),
      set: jest.fn(),
    };
    const secondNext = jest.fn();

    cacheMiddleware(mockRequest as Request, secondResponse as Response, secondNext);

    expect(secondNext).toHaveBeenCalled();
  });

  it('handles multiple cache entries', () => {
    mockResponse.statusCode = 200;

    // Cache first entry
    mockRequest.originalUrl = '/url1';
    cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    if (mockResponse.json) {
      mockResponse.json({ data: 'test1' });
    }

    // Cache second entry
    mockRequest.originalUrl = '/url2';
    cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    if (mockResponse.json) {
      mockResponse.json({ data: 'test2' });
    }

    expect(mockNext).toHaveBeenCalledTimes(2);
  });

  it('does not cache non-200 responses', () => {
    mockResponse.statusCode = 404;
    mockResponse.set = jest.fn();

    cacheMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    // Simulate 404 response - should not be cached
    if (mockResponse.json) {
      mockResponse.json({ error: 'Not found' });
    }

    // Verify no cache headers were set for error responses
    expect(mockResponse.set).not.toHaveBeenCalledWith(expect.objectContaining({ 'X-Cache': 'MISS' }));
  });
});
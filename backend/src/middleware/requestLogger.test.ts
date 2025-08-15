import { Request, Response, NextFunction } from 'express';
import { requestLogger } from './requestLogger';

// Mock console.log
const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
});

describe('Request Logger Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
    };

    mockResponse = {
      statusCode: 200,
      on: jest.fn(),
    };

    mockNext = jest.fn();
    
    // Clear console.log mock
    (console.log as jest.Mock).mockClear();
  });

  it('logs incoming requests', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('🔄 GET /test - 127.0.0.1')
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('logs response when response finishes', () => {
    const onMock = jest.fn();
    mockResponse.on = onMock;

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    // Simulate response finish
    const finishCallback = onMock.mock.calls.find(call => call[0] === 'finish')[1];
    finishCallback();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('✅ GET /test - 200')
    );
  });

  it('logs errors for 4xx status codes', () => {
    mockResponse.statusCode = 404;
    const onMock = jest.fn();
    mockResponse.on = onMock;

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    // Simulate response finish
    const finishCallback = onMock.mock.calls.find(call => call[0] === 'finish')[1];
    finishCallback();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('❌ GET /test - 404')
    );
  });

  it('logs errors for 5xx status codes', () => {
    mockResponse.statusCode = 500;
    const onMock = jest.fn();
    mockResponse.on = onMock;

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    // Simulate response finish
    const finishCallback = onMock.mock.calls.find(call => call[0] === 'finish')[1];
    finishCallback();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('❌ GET /test - 500')
    );
  });

  it('logs 3xx status codes with warning icon', () => {
    mockResponse.statusCode = 302;
    const onMock = jest.fn();
    mockResponse.on = onMock;

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    // Simulate response finish
    const finishCallback = onMock.mock.calls.find(call => call[0] === 'finish')[1];
    finishCallback();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('⚠️ GET /test - 302')
    );
  });

  it('handles missing IP address', () => {
    (mockRequest as any).ip = undefined;

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('🔄 GET /test - undefined')
    );
  });

  it('calculates response time correctly', (done) => {
    const onMock = jest.fn();
    mockResponse.on = onMock;

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    setTimeout(() => {
      // Simulate response finish after some time
      const finishCallback = onMock.mock.calls.find(call => call[0] === 'finish')[1];
      finishCallback();

      expect(console.log).toHaveBeenLastCalledWith(
        expect.stringMatching(/✅ GET \/test - 200 - \d+ms/)
      );
      done();
    }, 10);
  });

  it('calls next middleware', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('handles different HTTP methods', () => {
    mockRequest.method = 'POST';

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('🔄 POST /test')
    );
  });

  it('handles different URLs', () => {
    mockRequest.url = '/api/different';

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('🔄 GET /api/different')
    );
  });
});
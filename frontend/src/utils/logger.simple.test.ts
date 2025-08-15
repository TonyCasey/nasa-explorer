import logger from './logger';

// Mock console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  info: console.info,
};

beforeAll(() => {
  // Set NODE_ENV to development so logger actually logs to console
  process.env.NODE_ENV = 'development';
  
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.debug = jest.fn();
  console.info = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.debug = originalConsole.debug;
  console.info = originalConsole.info;
});

describe('Logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('INFO'),
      expect.any(String),
      expect.any(String)
    );
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('ERROR'),
      expect.any(String),
      expect.any(String)
    );
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('WARN'),
      expect.any(String),
      expect.any(String)
    );
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message');
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('DEBUG'),
      expect.any(String),
      expect.any(String)
    );
  });

  it('should handle log method calls', () => {
    logger.info('Test method call');
    expect(console.log).toHaveBeenCalled();
  });

  it('should handle objects in log messages', () => {
    const testObj = { key: 'value', number: 42 };
    logger.info('Test with object', testObj);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('INFO'),
      expect.any(String),
      expect.any(String)
    );
  });

  it('should handle error logging', () => {
    const error = new Error('Test error');
    logger.error('Error occurred', error);
    expect(console.error).toHaveBeenCalled();
  });

  it('should provide log retrieval methods', () => {
    logger.info('Test log entry');
    const logs = logger.getLogs();
    expect(Array.isArray(logs)).toBe(true);
  });

  it('should provide log clearing functionality', () => {
    logger.info('Test entry');
    logger.clearLogs();
    expect(logger.getLogs()).toHaveLength(0);
  });
});
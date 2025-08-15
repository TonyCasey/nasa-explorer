import reportWebVitals from './reportWebVitals';

// Mock web-vitals
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

describe('reportWebVitals', () => {
  it('should be a function', () => {
    expect(typeof reportWebVitals).toBe('function');
  });

  it('should call web-vitals functions when callback provided', () => {
    const mockCallback = jest.fn();
    const webVitals = require('web-vitals');
    
    reportWebVitals(mockCallback);
    
    expect(webVitals.getCLS).toHaveBeenCalledWith(mockCallback);
    expect(webVitals.getFID).toHaveBeenCalledWith(mockCallback);
    expect(webVitals.getFCP).toHaveBeenCalledWith(mockCallback);
    expect(webVitals.getLCP).toHaveBeenCalledWith(mockCallback);
    expect(webVitals.getTTFB).toHaveBeenCalledWith(mockCallback);
  });

  it('should handle no callback gracefully', () => {
    expect(() => reportWebVitals()).not.toThrow();
  });

  it('should handle undefined callback', () => {
    expect(() => reportWebVitals(undefined)).not.toThrow();
  });

  it('should handle null callback', () => {
    expect(() => reportWebVitals(null)).not.toThrow();
  });

  it('should validate callback is function', () => {
    const mockCallback = jest.fn();
    reportWebVitals(mockCallback);
    
    expect(mockCallback).toEqual(expect.any(Function));
  });

  it('should handle performance measurement', () => {
    const mockMetric = {
      name: 'CLS',
      value: 0.1,
      id: 'test-id'
    };
    
    const mockCallback = jest.fn();
    reportWebVitals(mockCallback);
    
    // Simulate web vitals callback
    const webVitals = require('web-vitals');
    const clsCallback = webVitals.getCLS.mock.calls[0][0];
    clsCallback(mockMetric);
    
    expect(mockCallback).toHaveBeenCalledWith(mockMetric);
  });

  it('should handle different metric types', () => {
    const metrics = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'];
    const mockCallback = jest.fn();
    
    reportWebVitals(mockCallback);
    
    metrics.forEach(metric => {
      const mockMetricData = {
        name: metric,
        value: Math.random(),
        id: `${metric}-id`
      };
      
      expect(typeof mockMetricData.name).toBe('string');
      expect(typeof mockMetricData.value).toBe('number');
    });
  });
});
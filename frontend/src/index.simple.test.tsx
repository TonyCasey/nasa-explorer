/**
 * @jest-environment jsdom
 */

// Mock React DOM
const mockRender = jest.fn();
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: mockRender
  }))
}));

// Mock the App component
jest.mock('./App', () => {
  return function MockApp() {
    return 'App Component';
  };
});

// Mock reportWebVitals
jest.mock('./reportWebVitals', () => jest.fn());

describe('Index', () => {
  beforeEach(() => {
    // Create a mock root element
    document.body.innerHTML = '<div id="root"></div>';
    mockRender.mockClear();
  });

  it('should have root element available', () => {
    const rootElement = document.getElementById('root');
    expect(rootElement).toBeInTheDocument();
  });

  it('should render app when imported', () => {
    // Import the index file to trigger the render
    require('./index');
    
    // Verify that render was called
    expect(mockRender).toHaveBeenCalled();
  });

  it('should create React root', () => {
    const { createRoot } = require('react-dom/client');
    
    // Import index to trigger createRoot
    require('./index');
    
    expect(createRoot).toHaveBeenCalled();
  });

  it('should handle DOM ready state', () => {
    // Test that document is ready
    expect(document.readyState).toBeDefined();
    expect(['loading', 'interactive', 'complete']).toContain(document.readyState);
  });

  it('should have HTML structure', () => {
    expect(document.documentElement).toBeInTheDocument();
    expect(document.body).toBeInTheDocument();
  });
});
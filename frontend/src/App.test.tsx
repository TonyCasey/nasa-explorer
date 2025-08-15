import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('./utils/logger', () => ({
  info: jest.fn(),
}));

jest.mock('./components/Navigation', () => {
  return function MockNavigation() {
    return <nav data-testid="navigation">Navigation</nav>;
  };
});

jest.mock('./components/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

jest.mock('./components/VersionFooter', () => {
  return function MockVersionFooter() {
    return <footer data-testid="version-footer">Version Footer</footer>;
  };
});

jest.mock('./pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard-page">Dashboard</div>;
  };
});

jest.mock('./pages/APOD', () => {
  return function MockAPOD() {
    return <div data-testid="apod-page">APOD</div>;
  };
});

jest.mock('./pages/MarsRovers', () => {
  return function MockMarsRovers() {
    return <div data-testid="mars-rovers-page">Mars Rovers</div>;
  };
});

jest.mock('./pages/NEOTracker', () => {
  return function MockNEOTracker() {
    return <div data-testid="neo-tracker-page">NEO Tracker</div>;
  };
});

jest.mock('./pages/Favorites', () => {
  return function MockFavorites() {
    return <div data-testid="favorites-page">Favorites</div>;
  };
});

const renderWithProviders = (component: React.ReactElement, initialRoute = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {component}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders main layout components', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('version-footer')).toBeInTheDocument();
  });

  it('renders dashboard by default', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('logs initialization message', () => {
    const logger = require('./utils/logger');
    renderWithProviders(<App />);
    
    expect(logger.info).toHaveBeenCalledWith('NASA Space Explorer App initialized');
  });

  it('has correct layout structure with background gradient', () => {
    const { container } = renderWithProviders(<App />);
    
    const rootDiv = container.querySelector('.bg-space-gradient');
    expect(rootDiv).toBeInTheDocument();
    expect(rootDiv).toHaveClass('flex', 'flex-col', 'min-h-screen');
  });

  it('renders main content area', () => {
    renderWithProviders(<App />);
    
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1', 'w-full', 'lg:w-auto');
  });

  it('navigates to APOD page', () => {
    renderWithProviders(<App />, '/apod');
    
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
  });

  it('navigates to Mars Rovers page', () => {
    renderWithProviders(<App />, '/mars-rovers');
    
    expect(screen.getByTestId('mars-rovers-page')).toBeInTheDocument();
  });

  it('navigates to NEO Tracker page', () => {
    renderWithProviders(<App />, '/neo-tracker');
    
    expect(screen.getByTestId('neo-tracker-page')).toBeInTheDocument();
  });

  it('navigates to Favorites page', () => {
    renderWithProviders(<App />, '/favorites');
    
    expect(screen.getByTestId('favorites-page')).toBeInTheDocument();
  });

  it('wraps content in error boundary', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});

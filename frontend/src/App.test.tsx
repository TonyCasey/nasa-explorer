// Mocks must be before imports
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('./utils/logger', () => ({
  info: jest.fn(),
}));

jest.mock('./services/nasa.service', () => ({
  getAPOD: jest.fn(),
  getMarsRoverPhotos: jest.fn(),
  getNearEarthObjects: jest.fn(),
}));

jest.mock('./components/Navigation', () => {
  return function MockNavigation() {
    return <nav data-testid="navigation">Navigation</nav>;
  };
});

jest.mock('./components/ErrorBoundary', () => {
  return function MockErrorBoundary({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

jest.mock('./components/VersionFooter', () => {
  return function MockVersionFooter() {
    return <footer data-testid="version-footer">Version Footer</footer>;
  };
});

jest.mock('./pages/Dashboard', () => {
  const MockDashboard = () => <div data-testid="dashboard-page">Dashboard</div>;
  MockDashboard.displayName = 'Dashboard';
  return { __esModule: true, default: MockDashboard };
});

jest.mock('./pages/APOD', () => {
  const MockAPOD = () => <div data-testid="apod-page">APOD</div>;
  MockAPOD.displayName = 'APOD';
  return { __esModule: true, default: MockAPOD };
});

jest.mock('./pages/MarsRovers', () => {
  const MockMarsRovers = () => (
    <div data-testid="mars-rovers-page">Mars Rovers</div>
  );
  MockMarsRovers.displayName = 'MarsRovers';
  return { __esModule: true, default: MockMarsRovers };
});

jest.mock('./pages/NEOTracker', () => {
  const MockNEOTracker = () => (
    <div data-testid="neo-tracker-page">NEO Tracker</div>
  );
  MockNEOTracker.displayName = 'NEOTracker';
  return { __esModule: true, default: MockNEOTracker };
});

jest.mock('./pages/Favorites', () => {
  const MockFavorites = () => <div data-testid="favorites-page">Favorites</div>;
  MockFavorites.displayName = 'Favorites';
  return { __esModule: true, default: MockFavorites };
});

const renderWithProviders = (
  component: React.ReactElement,
  initialRoute = '/'
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>{component}</MemoryRouter>
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

  it('renders app without crashing', () => {
    renderWithProviders(<App />);

    // Just verify basic structure renders without throwing
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('version-footer')).toBeInTheDocument();
  });

  it('logs initialization message', () => {
    const logger = require('./utils/logger');
    renderWithProviders(<App />);

    expect(logger.info).toHaveBeenCalledWith(
      'NASA Space Explorer App initialized'
    );
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

  it('renders routes container', () => {
    renderWithProviders(<App />);

    const mainElement = screen.getByRole('main');
    // Verify we have a main content area which would contain routes
    expect(mainElement).toBeInTheDocument();
  });

  it('wraps content in error boundary', () => {
    renderWithProviders(<App />);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});

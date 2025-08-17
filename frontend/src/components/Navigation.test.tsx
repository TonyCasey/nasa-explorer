import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

// Mock the useFavorites hook
jest.mock('../hooks/useFavorites', () => ({
  useFavorites: () => ({
    totalCount: 5,
  }),
}));

// Mock VersionFooter
jest.mock('./VersionFooter', () => {
  return function MockVersionFooter({
    minimal,
    className,
  }: {
    minimal?: boolean;
    className?: string;
  }) {
    return (
      <div data-testid="version-footer" className={className}>
        Version v1.3.0
      </div>
    );
  };
});

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Navigation />
    </MemoryRouter>
  );
};

// Mock window methods
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
});

describe('Navigation', () => {
  beforeEach(() => {
    // Reset viewport to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    jest.clearAllMocks();
  });

  test('renders navigation title and subtitle', () => {
    renderWithRouter();

    expect(screen.getByText('NASA Explorer')).toBeInTheDocument();
    expect(screen.getByText('Space Data Dashboard')).toBeInTheDocument();
  });

  test('renders all navigation items', () => {
    renderWithRouter();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Space Images')).toBeInTheDocument();
    expect(screen.getByText('Mars Rovers')).toBeInTheDocument();
    expect(screen.getByText('NEO Tracker')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  test('shows favorites count when greater than 0', () => {
    renderWithRouter();

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('highlights active navigation item', () => {
    renderWithRouter(['/apod']);

    const spaceImagesLink = screen.getByText('Space Images').closest('a');
    expect(spaceImagesLink).toHaveClass('bg-cosmic-purple/20');
  });

  test('shows version footer', () => {
    renderWithRouter();

    expect(screen.getByTestId('version-footer')).toBeInTheDocument();
  });

  test('shows NASA API attribution', () => {
    renderWithRouter();

    expect(screen.getByText('Powered by NASA APIs')).toBeInTheDocument();
  });

  test('navigation links have correct hrefs', () => {
    renderWithRouter();

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByText('Space Images').closest('a')).toHaveAttribute(
      'href',
      '/apod'
    );
    expect(screen.getByText('Mars Rovers').closest('a')).toHaveAttribute(
      'href',
      '/mars-rovers'
    );
    expect(screen.getByText('NEO Tracker').closest('a')).toHaveAttribute(
      'href',
      '/neo-tracker'
    );
    expect(screen.getByText('Favorites').closest('a')).toHaveAttribute(
      'href',
      '/favorites'
    );
  });

  test('applies hover styles to inactive items', () => {
    renderWithRouter();

    const marsRoversLink = screen.getByText('Mars Rovers').closest('a');
    expect(marsRoversLink).toHaveClass('hover:text-white', 'hover:bg-white/10');
  });

  test('detects mobile viewport and shows hamburger button', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    renderWithRouter();

    // Trigger resize event
    const resizeHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'resize'
    )?.[1];
    if (resizeHandler) {
      resizeHandler();
    }

    expect(
      screen.getByRole('button', { name: /toggle navigation menu/i })
    ).toBeInTheDocument();
  });

  test('toggles mobile menu when hamburger clicked', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    renderWithRouter();

    // Trigger resize event to set mobile state
    const resizeHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'resize'
    )?.[1];
    if (resizeHandler) {
      resizeHandler();
    }

    const hamburgerButton = screen.getByRole('button', {
      name: /toggle navigation menu/i,
    });
    fireEvent.click(hamburgerButton);

    // Check if mobile menu overlay is shown
    expect(screen.getByRole('navigation')).toHaveClass('translate-x-0');
  });

  test('closes mobile menu when overlay clicked', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    renderWithRouter();

    // Set mobile state and open menu
    const resizeHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'resize'
    )?.[1];
    if (resizeHandler) {
      resizeHandler();
    }

    const hamburgerButton = screen.getByRole('button', {
      name: /toggle navigation menu/i,
    });
    fireEvent.click(hamburgerButton);

    // Click overlay to close
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(screen.getByRole('navigation')).toHaveClass('-translate-x-full');
  });

  test('adds and removes resize event listener', () => {
    const { unmount } = renderWithRouter();

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  test('renders with zero favorites count', () => {
    // Override the mock for this test
    jest.doMock('../hooks/useFavorites', () => ({
      useFavorites: () => ({
        totalCount: 0,
      }),
    }));

    renderWithRouter();

    // Should not show the count badge when totalCount is 0
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('handles click outside mobile menu', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    renderWithRouter();

    // Set mobile state and open menu
    const resizeHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'resize'
    )?.[1];
    if (resizeHandler) {
      resizeHandler();
    }

    const hamburgerButton = screen.getByRole('button', {
      name: /toggle navigation menu/i,
    });
    fireEvent.click(hamburgerButton);

    // Simulate clicking outside
    const clickHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'click'
    )?.[1];
    if (clickHandler) {
      const mockEvent = {
        target: document.body,
      } as unknown as MouseEvent;
      clickHandler(mockEvent);
    }

    expect(screen.getByRole('navigation')).toHaveClass('-translate-x-full');
  });
});

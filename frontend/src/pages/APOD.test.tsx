import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import APOD from './APOD';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Mock NASA service
jest.mock('../services/nasa.service', () => ({
  nasaService: {
    getAPOD: jest.fn(),
    getAPODRange: jest.fn(),
  },
}));

// Mock components
jest.mock('../components/DatePicker', () => {
  return function MockDatePicker({
    value,
    onChange,
  }: {
    value: string;
    onChange: (date: string) => void;
  }) {
    return (
      <input
        data-testid="date-picker"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

jest.mock('../components/ImageViewer', () => {
  return function MockImageViewer({ src, alt }: { src: string; alt: string }) {
    return <img data-testid="image-viewer" src={src} alt={alt} />;
  };
});

jest.mock('../components/FavoriteButton', () => {
  return function MockFavoriteButton({ item }: { item: any }) {
    return <button data-testid="favorite-button">Favorite</button>;
  };
});

jest.mock('../components/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock('../components/ErrorBoundary', () => {
  return function MockErrorBoundary({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('APOD', () => {
  const mockAPOD = {
    date: '2025-08-15',
    title: 'Test APOD Title',
    url: 'https://example.com/image.jpg',
    hdurl: 'https://example.com/hd-image.jpg',
    explanation: 'This is a test APOD explanation.',
    media_type: 'image',
    copyright: 'Test Copyright',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders APOD page title', () => {
    renderWithProviders(<APOD />);

    expect(
      screen.getByText('Astronomy Picture of the Day')
    ).toBeInTheDocument();
  });

  it('renders date picker', () => {
    renderWithProviders(<APOD />);

    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithProviders(<APOD />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders APOD content when data is loaded', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getAPOD.mockResolvedValue(mockAPOD);

    renderWithProviders(<APOD />);

    await waitFor(() => {
      expect(screen.getByText('Test APOD Title')).toBeInTheDocument();
    });

    expect(
      screen.getByText('This is a test APOD explanation.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('image-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-button')).toBeInTheDocument();
  });

  it('displays copyright information when available', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getAPOD.mockResolvedValue(mockAPOD);

    renderWithProviders(<APOD />);

    await waitFor(() => {
      expect(screen.getByText(/Test Copyright/)).toBeInTheDocument();
    });
  });

  it('handles date picker changes', async () => {
    const user = userEvent.setup();
    const { nasaService } = require('../services/nasa.service');
    nasaService.getAPOD.mockResolvedValue(mockAPOD);

    renderWithProviders(<APOD />);

    const datePicker = screen.getByTestId('date-picker');
    await user.clear(datePicker);
    await user.type(datePicker, '2025-08-14');

    expect(nasaService.getAPOD).toHaveBeenCalledWith('2025-08-14');
  });

  it('handles video media type', async () => {
    const { nasaService } = require('../services/nasa.service');
    const mockVideoAPOD = {
      ...mockAPOD,
      media_type: 'video',
      url: 'https://example.com/video.mp4',
    };
    nasaService.getAPOD.mockResolvedValue(mockVideoAPOD);

    renderWithProviders(<APOD />);

    await waitFor(() => {
      expect(screen.getByText('Test APOD Title')).toBeInTheDocument();
    });

    // Should still render content even for video type
    expect(
      screen.getByText('This is a test APOD explanation.')
    ).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getAPOD.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<APOD />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('handles today date as default', () => {
    const { nasaService } = require('../services/nasa.service');
    nasaService.getAPOD.mockResolvedValue(mockAPOD);

    renderWithProviders(<APOD />);

    expect(nasaService.getAPOD).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/)
    );
  });
});

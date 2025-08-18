import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import APOD from './APOD';

// Mock NASA service
jest.mock('../services/nasa.service');

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
      screen.getByText('🌌 Astronomy Picture of the Day')
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
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPOD);

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
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPOD);

    renderWithProviders(<APOD />);

    await waitFor(() => {
      expect(screen.getByText(/Test Copyright/)).toBeInTheDocument();
    });
  });

  it('handles date picker changes', async () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPOD);

    renderWithProviders(<APOD />);

    const datePicker = screen.getByTestId('date-picker');
    await userEvent.clear(datePicker);
    await userEvent.type(datePicker, '2025-08-14');

    expect(NASAService.getAPOD).toHaveBeenCalledWith('2025-08-14');
  });

  it('handles video media type', async () => {
    const NASAService = require('../services/nasa.service').default;
    const mockVideoAPOD = {
      ...mockAPOD,
      media_type: 'video',
      url: 'https://example.com/video.mp4',
    };
    NASAService.getAPOD.mockResolvedValue(mockVideoAPOD);

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
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<APOD />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('handles today date as default', () => {
    const NASAService = require('../services/nasa.service').default;
    NASAService.getAPOD.mockResolvedValue(mockAPOD);

    renderWithProviders(<APOD />);

    expect(NASAService.getAPOD).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/)
    );
  });
});

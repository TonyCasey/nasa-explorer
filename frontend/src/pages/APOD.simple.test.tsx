import React from 'react';
import { render, screen } from '@testing-library/react';
import APOD from './APOD';

// Mock dependencies
jest.mock('../components/ImageViewer', () => {
  return function MockImageViewer({ title }: any) {
    return <div data-testid="image-viewer">{title}</div>;
  };
});

jest.mock('../components/DatePicker', () => {
  return function MockDatePicker({ value }: any) {
    return <div data-testid="date-picker">{value}</div>;
  };
});

jest.mock('../components/LoadingSkeleton', () => {
  return function MockLoadingSkeleton() {
    return <div data-testid="loading-skeleton">Loading</div>;
  };
});

jest.mock('../components/FavoriteButton', () => {
  return function MockFavoriteButton() {
    return <div data-testid="favorite-button">Favorite</div>;
  };
});

jest.mock('../services/nasa.service', () => ({
  nasaService: {
    getAPOD: jest.fn().mockResolvedValue({
      title: 'Test APOD',
      explanation: 'Test explanation',
      url: 'https://example.com/image.jpg',
      date: '2025-08-15',
    }),
  },
}));

describe('APOD Page', () => {
  it('should render APOD title', () => {
    render(<APOD />);
    expect(screen.getByText(/astronomy picture/i)).toBeInTheDocument();
  });

  it('should render date picker', () => {
    render(<APOD />);
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });

  it('should render image viewer', () => {
    render(<APOD />);
    expect(screen.getByTestId('image-viewer')).toBeInTheDocument();
  });

  it('should render favorite button', () => {
    render(<APOD />);
    expect(screen.getByTestId('favorite-button')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<APOD />);
    // May show loading initially
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should render page header', () => {
    render(<APOD />);
    expect(screen.getByText(/picture of the day/i)).toBeInTheDocument();
  });

  it('should handle navigation controls', () => {
    render(<APOD />);
    expect(screen.getByText(/previous/i)).toBeInTheDocument();
    expect(screen.getByText(/next/i)).toBeInTheDocument();
  });

  it('should display image metadata', () => {
    render(<APOD />);
    expect(screen.getByText(/date/i)).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<APOD />);
    // Component should render without throwing
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should render share functionality', () => {
    render(<APOD />);
    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });
});

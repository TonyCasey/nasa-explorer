import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageViewer from './ImageViewer';

describe('ImageViewer', () => {
  const mockImage = {
    url: 'https://example.com/image.jpg',
    title: 'Test Image',
    description: 'Test description',
    date: '2025-08-15',
  };

  it('should render image', () => {
    render(<ImageViewer {...mockImage} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockImage.url);
    expect(image).toHaveAttribute('alt', mockImage.title);
  });

  it('should render image title', () => {
    render(<ImageViewer {...mockImage} />);
    expect(screen.getByText('Test Image')).toBeInTheDocument();
  });

  it('should render image description', () => {
    render(<ImageViewer {...mockImage} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should render image date', () => {
    render(<ImageViewer {...mockImage} />);
    expect(screen.getByText('2025-08-15')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<ImageViewer {...mockImage} loading={true} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<ImageViewer {...mockImage} error="Failed to load image" />);
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  it('should handle zoom functionality', () => {
    render(<ImageViewer {...mockImage} zoomable={true} />);
    const image = screen.getByRole('img');

    fireEvent.click(image);
    expect(image).toHaveClass('cursor-zoom-in');
  });

  it('should handle fullscreen mode', () => {
    render(<ImageViewer {...mockImage} fullscreen={true} />);
    const container = screen.getByRole('img').closest('div');
    expect(container).toHaveClass('fixed', 'inset-0');
  });

  it('should handle download functionality', () => {
    const mockOnDownload = jest.fn();
    render(<ImageViewer {...mockImage} onDownload={mockOnDownload} />);

    const downloadButton = screen.getByText(/download/i);
    fireEvent.click(downloadButton);
    expect(mockOnDownload).toHaveBeenCalledWith(mockImage.url);
  });

  it('should handle favorite toggle', () => {
    const mockOnFavorite = jest.fn();
    render(<ImageViewer {...mockImage} onFavorite={mockOnFavorite} />);

    const favoriteButton = screen.getByLabelText(/favorite/i);
    fireEvent.click(favoriteButton);
    expect(mockOnFavorite).toHaveBeenCalled();
  });

  it('should handle missing optional props', () => {
    render(<ImageViewer url={mockImage.url} />);
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });

  it('should handle keyboard navigation', () => {
    render(<ImageViewer {...mockImage} />);
    const image = screen.getByRole('img');

    fireEvent.keyDown(image, { key: 'Enter' });
    expect(image).toHaveFocus();
  });
});

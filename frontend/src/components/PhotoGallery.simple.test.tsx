import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PhotoGallery from './PhotoGallery';

const mockPhotos = [
  {
    id: 1,
    img_src: 'https://example.com/photo1.jpg',
    earth_date: '2025-08-15',
    camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
    rover: { name: 'Curiosity' }
  },
  {
    id: 2,
    img_src: 'https://example.com/photo2.jpg',
    earth_date: '2025-08-15',
    camera: { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
    rover: { name: 'Curiosity' }
  }
];

describe('PhotoGallery', () => {
  it('should render empty state', () => {
    render(<PhotoGallery photos={[]} loading={false} />);
    expect(screen.getByText(/no photos/i)).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(<PhotoGallery photos={[]} loading={true} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render photos grid', () => {
    render(<PhotoGallery photos={mockPhotos} loading={false} />);
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('should handle photo click', () => {
    const mockOnPhotoClick = jest.fn();
    render(<PhotoGallery photos={mockPhotos} loading={false} onPhotoClick={mockOnPhotoClick} />);
    
    fireEvent.click(screen.getAllByRole('img')[0]);
    expect(mockOnPhotoClick).toHaveBeenCalledWith(mockPhotos[0]);
  });

  it('should display photo metadata', () => {
    render(<PhotoGallery photos={mockPhotos} loading={false} />);
    expect(screen.getByText('FHAZ')).toBeInTheDocument();
    expect(screen.getByText('2025-08-15')).toBeInTheDocument();
  });

  it('should handle favorite toggle', () => {
    const mockOnFavorite = jest.fn();
    render(<PhotoGallery photos={mockPhotos} loading={false} onFavorite={mockOnFavorite} />);
    
    const favoriteButtons = screen.getAllByLabelText(/favorite/i);
    fireEvent.click(favoriteButtons[0]);
    expect(mockOnFavorite).toHaveBeenCalled();
  });

  it('should render with grid layout', () => {
    render(<PhotoGallery photos={mockPhotos} loading={false} layout="grid" />);
    const gallery = screen.getByRole('region', { name: /photo gallery/i });
    expect(gallery).toHaveClass('grid');
  });

  it('should render with list layout', () => {
    render(<PhotoGallery photos={mockPhotos} loading={false} layout="list" />);
    const gallery = screen.getByRole('region', { name: /photo gallery/i });
    expect(gallery).toHaveClass('flex-col');
  });

  it('should handle keyboard navigation', () => {
    render(<PhotoGallery photos={mockPhotos} loading={false} />);
    const firstPhoto = screen.getAllByRole('img')[0];
    
    fireEvent.keyDown(firstPhoto, { key: 'Enter' });
    // Test that keyboard interaction works
    expect(firstPhoto).toHaveFocus();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteButton from './FavoriteButton';

describe('FavoriteButton', () => {
  const mockOnToggle = jest.fn();
  const mockItem = {
    id: '1',
    title: 'Test Item',
    url: 'https://example.com/image.jpg',
    type: 'apod' as const
  };

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('should render favorite button', () => {
    render(<FavoriteButton item={mockItem} isFavorite={false} onToggle={mockOnToggle} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show unfavorited state', () => {
    render(<FavoriteButton item={mockItem} isFavorite={false} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should show favorited state', () => {
    render(<FavoriteButton item={mockItem} isFavorite={true} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onToggle when clicked', () => {
    render(<FavoriteButton item={mockItem} isFavorite={false} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(mockOnToggle).toHaveBeenCalledWith(mockItem);
  });

  it('should handle keyboard navigation', () => {
    render(<FavoriteButton item={mockItem} isFavorite={false} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button');
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnToggle).toHaveBeenCalledWith(mockItem);
  });

  it('should have proper accessibility attributes', () => {
    render(<FavoriteButton item={mockItem} isFavorite={false} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
  });

  it('should handle disabled state', () => {
    render(<FavoriteButton item={mockItem} isFavorite={false} onToggle={mockOnToggle} disabled={true} />);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockOnToggle).not.toHaveBeenCalled();
  });
});
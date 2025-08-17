import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FavoriteButton from './FavoriteButton';
import { Favorite } from '../services/favorites.service';

// Mock the useFavorites hook
const mockToggleFavorite = jest.fn().mockReturnValue(true);
const mockIsFavorite = jest.fn().mockReturnValue(false);

jest.mock('../hooks/useFavorites', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    isFavorite: mockIsFavorite,
  }),
}));

describe('FavoriteButton', () => {
  const mockItem: Omit<Favorite, 'savedAt'> = {
    id: 'test-1',
    type: 'apod',
    title: 'Test APOD',
    thumbnail: 'https://test.com/image.jpg',
    data: { test: 'data' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFavorite.mockReturnValue(false);
    mockToggleFavorite.mockReturnValue(true);
  });

  it('renders correctly', () => {
    render(<FavoriteButton item={mockItem} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows correct title when not favorited', () => {
    render(<FavoriteButton item={mockItem} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Add to favorites');
  });

  it('toggles favorite state on click', async () => {
    render(<FavoriteButton item={mockItem} />);
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');

    // Initially should not be favorited
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('fill', 'none');

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith(mockItem);
    });

    // After click, the component state should update
    await waitFor(() => {
      const updatedSvg = button.querySelector('svg');
      expect(updatedSvg).toHaveAttribute('stroke', '#F59E0B');
      expect(updatedSvg).toHaveAttribute('fill', '#F59E0B');
    });
  });

  it('applies custom className', () => {
    render(<FavoriteButton item={mockItem} className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<FavoriteButton item={mockItem} size="sm" />);
    let svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveClass('w-5', 'h-5');

    rerender(<FavoriteButton item={mockItem} size="md" />);
    svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveClass('w-6', 'h-6');

    rerender(<FavoriteButton item={mockItem} size="lg" />);
    svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveClass('w-8', 'h-8');
  });

  it('prevents event propagation on click', () => {
    const handleParentClick = jest.fn();
    render(
      <div onClick={handleParentClick}>
        <FavoriteButton item={mockItem} />
      </div>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleParentClick).not.toHaveBeenCalled();
  });
});

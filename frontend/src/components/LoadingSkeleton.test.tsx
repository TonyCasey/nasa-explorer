import React from 'react';
import { render } from '@testing-library/react';
import LoadingSkeleton from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders with default props (card type)', () => {
    const { container } = render(<LoadingSkeleton />);

    expect(container.firstChild).toHaveClass('glass-effect');
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('rounded-xl');
  });

  it('renders with custom className', () => {
    const { container } = render(
      <LoadingSkeleton className="custom-skeleton" />
    );

    expect(container.firstChild).toHaveClass('custom-skeleton');
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders multiple items when count is specified', () => {
    const { container } = render(<LoadingSkeleton count={3} />);

    const skeletons = container.querySelectorAll('.glass-effect');
    expect(skeletons).toHaveLength(3);
  });

  it('renders image type skeleton', () => {
    const { container } = render(<LoadingSkeleton type="image" />);

    expect(container.firstChild).toHaveClass('bg-white/10');
    expect(container.firstChild).toHaveClass('rounded-lg');
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders text type skeleton', () => {
    const { container } = render(<LoadingSkeleton type="text" />);

    expect(container.firstChild).toHaveClass('space-y-2');
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders list type skeleton', () => {
    const { container } = render(<LoadingSkeleton type="list" />);

    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('items-center');
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('applies animation class for all types', () => {
    const types: Array<'card' | 'image' | 'text' | 'list'> = [
      'card',
      'image',
      'text',
      'list',
    ];

    types.forEach((type) => {
      const { container } = render(<LoadingSkeleton type={type} />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });
  });

  it('renders with data-testid when provided', () => {
    const { container } = render(
      <LoadingSkeleton data-testid="loading-skeleton" />
    );

    expect(container.firstChild).toHaveAttribute(
      'data-testid',
      'loading-skeleton'
    );
  });

  it('renders multiple items with different types', () => {
    const { container: cardContainer } = render(
      <LoadingSkeleton type="card" count={2} />
    );
    const { container: imageContainer } = render(
      <LoadingSkeleton type="image" count={2} />
    );

    expect(cardContainer.querySelectorAll('.glass-effect')).toHaveLength(2);
    expect(imageContainer.querySelectorAll('.bg-white\\/10')).toHaveLength(2);
  });
});

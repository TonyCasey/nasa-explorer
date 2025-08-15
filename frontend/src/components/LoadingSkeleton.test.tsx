import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSkeleton from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSkeleton />);
    
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('bg-gray-300');
  });

  it('renders with custom width', () => {
    const { container } = render(<LoadingSkeleton width="200px" />);
    
    expect(container.firstChild).toHaveStyle({ width: '200px' });
  });

  it('renders with custom height', () => {
    const { container } = render(<LoadingSkeleton height="50px" />);
    
    expect(container.firstChild).toHaveStyle({ height: '50px' });
  });

  it('renders with custom className', () => {
    const { container } = render(<LoadingSkeleton className="custom-skeleton" />);
    
    expect(container.firstChild).toHaveClass('custom-skeleton');
  });

  it('renders multiple lines when count is specified', () => {
    const { container } = render(<LoadingSkeleton count={3} />);
    
    const skeletons = container.querySelectorAll('[data-testid="skeleton-line"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders with circular variant', () => {
    const { container } = render(<LoadingSkeleton variant="circular" />);
    
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('renders with rectangular variant', () => {
    const { container } = render(<LoadingSkeleton variant="rectangular" />);
    
    expect(container.firstChild).toHaveClass('rounded-none');
  });

  it('renders with text variant (default)', () => {
    const { container } = render(<LoadingSkeleton variant="text" />);
    
    expect(container.firstChild).toHaveClass('rounded');
  });

  it('applies animation class', () => {
    const { container } = render(<LoadingSkeleton />);
    
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders with data-testid for testing', () => {
    render(<LoadingSkeleton />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
});
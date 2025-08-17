import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<LoadingSpinner message="Custom loading message" />);
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });

  it('should render spinner animation', () => {
    render(<LoadingSpinner />);
    const spinnerDiv = screen.getByRole('status');
    expect(spinnerDiv).toHaveClass('animate-spin');
  });
});

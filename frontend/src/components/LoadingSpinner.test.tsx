import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner with default props', () => {
    const { container } = render(<LoadingSpinner />);

    const spinnerElements = container.querySelectorAll('.animate-spin');
    expect(spinnerElements).toHaveLength(2);
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);

    const sizedElement = container.querySelector('.w-16.h-16');
    expect(sizedElement).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);

    const sizedElement = container.querySelector('.w-6.h-6');
    expect(sizedElement).toBeInTheDocument();
  });

  it('renders with medium size (default)', () => {
    const { container } = render(<LoadingSpinner size="md" />);

    const sizedElement = container.querySelector('.w-12.h-12');
    expect(sizedElement).toBeInTheDocument();
  });

  it('displays loading message when provided', () => {
    render(<LoadingSpinner message="Loading data..." />);

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders fullscreen when fullScreen prop is true', () => {
    const { container } = render(<LoadingSpinner fullScreen={true} />);

    const fullscreenElement = container.querySelector('.fixed.inset-0');
    expect(fullscreenElement).toBeInTheDocument();
  });

  it('renders inline when fullScreen prop is false', () => {
    const { container } = render(<LoadingSpinner fullScreen={false} />);

    const inlineElement = container.querySelector(
      '.flex.items-center.justify-center'
    );
    expect(inlineElement).toBeInTheDocument();
    expect(container.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
  });

  it('renders bouncing dots animation', () => {
    const { container } = render(<LoadingSpinner />);

    const bouncingDots = container.querySelectorAll('.animate-bounce');
    expect(bouncingDots).toHaveLength(3);
  });

  it('has proper color classes for spinner rings', () => {
    const { container } = render(<LoadingSpinner />);

    const purpleRing = container.querySelector('.border-t-cosmic-purple');
    const orangeRing = container.querySelector('.border-t-solar-orange');

    expect(purpleRing).toBeInTheDocument();
    expect(orangeRing).toBeInTheDocument();
  });
});

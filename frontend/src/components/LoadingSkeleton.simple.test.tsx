import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSkeleton from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render skeleton with default props', () => {
    render(<LoadingSkeleton />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render with custom height', () => {
    render(<LoadingSkeleton height="200px" />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveStyle({ height: '200px' });
  });

  it('should render with custom width', () => {
    render(<LoadingSkeleton width="300px" />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveStyle({ width: '300px' });
  });

  it('should render multiple lines', () => {
    render(<LoadingSkeleton lines={3} />);
    const skeletons = screen.getAllByTestId('loading-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should render with animation', () => {
    render(<LoadingSkeleton animate={true} />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should render without animation', () => {
    render(<LoadingSkeleton animate={false} />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).not.toHaveClass('animate-pulse');
  });

  it('should render with rounded corners', () => {
    render(<LoadingSkeleton rounded={true} />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('rounded');
  });

  it('should render with custom className', () => {
    render(<LoadingSkeleton className="custom-class" />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should handle different shapes', () => {
    const { rerender } = render(<LoadingSkeleton shape="circle" />);
    expect(screen.getByTestId('loading-skeleton')).toHaveClass('rounded-full');

    rerender(<LoadingSkeleton shape="rectangle" />);
    expect(screen.getByTestId('loading-skeleton')).toHaveClass('rounded-none');
  });
});
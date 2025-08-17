import React from 'react';
import { render, screen } from '@testing-library/react';
import DataWidget from './DataWidget';

describe('DataWidget', () => {
  it('renders title and children correctly', () => {
    render(
      <DataWidget title="Test Widget">
        <div>Widget Content</div>
      </DataWidget>
    );

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Widget Content')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <DataWidget title="Loading Widget" isLoading={true}>
        <div>Content</div>
      </DataWidget>
    );

    expect(screen.getByText('Loading Widget')).toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders error state when error is provided', () => {
    render(
      <DataWidget title="Error Widget" error="Something went wrong">
        <div>Content</div>
      </DataWidget>
    );

    expect(screen.getByText('Error Widget')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders children when not loading and no error', () => {
    render(
      <DataWidget title="Normal Widget">
        <div>Normal Content</div>
      </DataWidget>
    );

    expect(screen.getByText('Normal Widget')).toBeInTheDocument();
    expect(screen.getByText('Normal Content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DataWidget title="Custom Widget" className="custom-widget">
        <div>Content</div>
      </DataWidget>
    );

    expect(container.firstChild).toHaveClass('custom-widget');
  });

  it('handles refresh functionality', () => {
    const mockRefresh = jest.fn();

    render(
      <DataWidget title="Refreshable Widget" onRefresh={mockRefresh}>
        <div>Content</div>
      </DataWidget>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });
});

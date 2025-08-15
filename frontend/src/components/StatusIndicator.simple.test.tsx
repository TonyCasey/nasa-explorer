import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusIndicator from './StatusIndicator';

describe('StatusIndicator', () => {
  it('should render online status', () => {
    render(<StatusIndicator status="online" />);
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('bg-green-500');
  });

  it('should render offline status', () => {
    render(<StatusIndicator status="offline" />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('bg-red-500');
  });

  it('should render loading status', () => {
    render(<StatusIndicator status="loading" />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('bg-yellow-500');
  });

  it('should render error status', () => {
    render(<StatusIndicator status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('bg-red-500');
  });

  it('should render with custom label', () => {
    render(<StatusIndicator status="online" label="Connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    render(<StatusIndicator status="online" size="large" />);
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4');
  });

  it('should render with pulse animation', () => {
    render(<StatusIndicator status="loading" pulse={true} />);
    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });

  it('should handle missing label gracefully', () => {
    render(<StatusIndicator status="online" showLabel={false} />);
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
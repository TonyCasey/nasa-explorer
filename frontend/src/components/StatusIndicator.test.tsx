import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusIndicator from './StatusIndicator';

describe('StatusIndicator', () => {
  it('renders with online status', () => {
    render(<StatusIndicator status="online" />);

    expect(screen.getByText(/online/i)).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass('status-online');
  });

  it('renders with offline status', () => {
    render(<StatusIndicator status="offline" />);

    expect(screen.getByText(/offline/i)).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass(
      'status-offline'
    );
  });

  it('renders with loading status', () => {
    render(<StatusIndicator status="loading" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass(
      'status-loading'
    );
  });

  it('renders with error status', () => {
    render(<StatusIndicator status="error" />);

    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass('status-error');
  });

  it('renders with warning status', () => {
    render(<StatusIndicator status="warning" />);

    expect(screen.getByText(/warning/i)).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass(
      'status-warning'
    );
  });

  it('renders with custom message', () => {
    render(
      <StatusIndicator status="online" message="All systems operational" />
    );

    expect(screen.getByText('All systems operational')).toBeInTheDocument();
  });

  it('renders with default message when none provided', () => {
    render(<StatusIndicator status="online" />);

    expect(screen.getByText(/online/i)).toBeInTheDocument();
  });

  it('renders status icon', () => {
    render(<StatusIndicator status="online" />);

    const statusIcon = screen.getByTestId('status-icon');
    expect(statusIcon).toBeInTheDocument();
  });

  it('has pulsing animation for loading status', () => {
    render(<StatusIndicator status="loading" />);

    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toHaveClass('animate-pulse');
  });

  it('shows timestamp when provided', () => {
    const timestamp = new Date().toISOString();
    render(<StatusIndicator status="online" timestamp={timestamp} />);

    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<StatusIndicator status="online" className="custom-status" />);

    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toHaveClass('custom-status');
  });

  it('shows connection details for online status', () => {
    render(
      <StatusIndicator
        status="online"
        details={{ latency: '50ms', uptime: '99.9%' }}
      />
    );

    expect(screen.getByText(/50ms/)).toBeInTheDocument();
    expect(screen.getByText(/99.9%/)).toBeInTheDocument();
  });

  it('shows error details for error status', () => {
    render(
      <StatusIndicator
        status="error"
        details={{ error: 'Connection failed', code: 500 }}
      />
    );

    expect(screen.getByText(/Connection failed/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<StatusIndicator status="online" onClick={handleClick} />);

    const indicator = screen.getByTestId('status-indicator');
    indicator.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is not clickable when no onClick provided', () => {
    render(<StatusIndicator status="online" />);

    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).not.toHaveAttribute('role', 'button');
  });

  it('has proper accessibility attributes', () => {
    render(<StatusIndicator status="online" />);

    const indicator = screen.getByTestId('status-indicator');
    expect(indicator).toHaveAttribute('aria-label');
    expect(indicator).toHaveAttribute('role', 'status');
  });

  it('renders different colors for different statuses', () => {
    const { rerender } = render(<StatusIndicator status="online" />);
    expect(screen.getByTestId('status-indicator')).toHaveClass(
      'text-green-500'
    );

    rerender(<StatusIndicator status="error" />);
    expect(screen.getByTestId('status-indicator')).toHaveClass('text-red-500');

    rerender(<StatusIndicator status="warning" />);
    expect(screen.getByTestId('status-indicator')).toHaveClass(
      'text-yellow-500'
    );

    rerender(<StatusIndicator status="loading" />);
    expect(screen.getByTestId('status-indicator')).toHaveClass('text-blue-500');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusIndicator from './StatusIndicator';

describe('StatusIndicator', () => {
  it('renders with online status', () => {
    render(<StatusIndicator status="online" label="System Status" />);

    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('🟢')).toBeInTheDocument();
  });

  it('renders with offline status', () => {
    render(<StatusIndicator status="offline" label="Connection" />);

    expect(screen.getByText('Connection')).toBeInTheDocument();
    expect(screen.getByText('⚫')).toBeInTheDocument();
  });

  it('renders with error status', () => {
    render(<StatusIndicator status="error" label="API Status" />);

    expect(screen.getByText('API Status')).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('renders with warning status', () => {
    render(<StatusIndicator status="warning" label="Rate Limit" />);

    expect(screen.getByText('Rate Limit')).toBeInTheDocument();
    expect(screen.getByText('🟡')).toBeInTheDocument();
  });

  it('renders with success status', () => {
    render(<StatusIndicator status="success" label="Operation Complete" />);

    expect(screen.getByText('Operation Complete')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <StatusIndicator
        status="online"
        label="NASA API"
        description="All systems operational"
      />
    );

    expect(screen.getByText('NASA API')).toBeInTheDocument();
    expect(screen.getByText('All systems operational')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <StatusIndicator status="online" label="Test" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(
      <StatusIndicator status="online" label="Small" size="small" />
    );
    expect(container.querySelector('.text-xs')).toBeInTheDocument();

    rerender(<StatusIndicator status="online" label="Medium" size="medium" />);
    expect(container.querySelector('.text-base')).toBeInTheDocument();

    rerender(<StatusIndicator status="online" label="Large" size="large" />);
    expect(container.querySelector('.text-lg')).toBeInTheDocument();
  });

  it('applies correct color classes for each status', () => {
    const { container, rerender } = render(
      <StatusIndicator status="online" label="Test" />
    );
    expect(container.querySelector('.bg-aurora-green')).toBeInTheDocument();

    rerender(<StatusIndicator status="error" label="Test" />);
    expect(container.querySelector('.bg-mars-red')).toBeInTheDocument();

    rerender(<StatusIndicator status="warning" label="Test" />);
    expect(container.querySelector('.bg-stellar-yellow')).toBeInTheDocument();
  });

  it('has pulsing animation', () => {
    const { container } = render(
      <StatusIndicator status="online" label="Test" />
    );
    expect(container.querySelector('.animate-pulse-slow')).toBeInTheDocument();
  });
});

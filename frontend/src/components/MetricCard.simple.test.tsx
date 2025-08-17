import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

describe('MetricCard', () => {
  const mockData = {
    title: 'Total Users',
    value: 1234,
    icon: '👥',
    trend: 'up' as const,
    change: 15.2,
  };

  it('should render metric title', () => {
    render(<MetricCard {...mockData} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('should render metric value', () => {
    render(<MetricCard {...mockData} />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(<MetricCard {...mockData} />);
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<MetricCard {...mockData} loading={true} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<MetricCard {...mockData} error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('should handle different trend types', () => {
    const { rerender } = render(<MetricCard {...mockData} trend="up" />);
    expect(screen.getByText('+15.2%')).toBeInTheDocument();

    rerender(<MetricCard {...mockData} trend="down" change={-8.5} />);
    expect(screen.getByText('-8.5%')).toBeInTheDocument();

    rerender(<MetricCard {...mockData} trend="flat" change={0} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('should handle animation states', () => {
    render(<MetricCard {...mockData} animate={true} />);
    expect(screen.getByText('Total Users').closest('.metric-card')).toHaveClass(
      'animate-fade-in'
    );
  });
});

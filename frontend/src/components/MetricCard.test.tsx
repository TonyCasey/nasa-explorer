import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

describe('MetricCard', () => {
  it('renders title and value correctly', () => {
    render(
      <MetricCard 
        title="Test Metric" 
        value="42" 
        icon="🚀"
      />
    );
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('renders without icon', () => {
    render(
      <MetricCard 
        title="No Icon Metric" 
        value="100" 
      />
    );
    
    expect(screen.getByText('No Icon Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <MetricCard 
        title="Custom Class" 
        value="200" 
        className="custom-metric-card"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-metric-card');
  });

  it('handles large numbers in value', () => {
    render(
      <MetricCard 
        title="Large Number" 
        value="1,234,567" 
      />
    );
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('handles string values', () => {
    render(
      <MetricCard 
        title="Status" 
        value="Active" 
      />
    );
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
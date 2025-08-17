import React from 'react';
import { render, screen } from '@testing-library/react';
import NEOCard from './NEOCard';

const mockNEO = {
  id: '54016',
  name: '54016 (1999 JV3)',
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: 0.1234,
      estimated_diameter_max: 0.2759,
    },
  },
  close_approach_data: [
    {
      close_approach_date: '2025-08-15',
      relative_velocity: {
        kilometers_per_hour: '45123.456',
      },
      miss_distance: {
        kilometers: '12345678.123',
      },
    },
  ],
  is_potentially_hazardous_asteroid: false,
};

describe('NEOCard', () => {
  it('should render NEO name', () => {
    render(<NEOCard neo={mockNEO} />);
    expect(screen.getByText('54016 (1999 JV3)')).toBeInTheDocument();
  });

  it('should render diameter information', () => {
    render(<NEOCard neo={mockNEO} />);
    expect(screen.getByText(/diameter/i)).toBeInTheDocument();
    expect(screen.getByText(/0.12/)).toBeInTheDocument();
  });

  it('should render approach date', () => {
    render(<NEOCard neo={mockNEO} />);
    expect(screen.getByText('2025-08-15')).toBeInTheDocument();
  });

  it('should render velocity', () => {
    render(<NEOCard neo={mockNEO} />);
    expect(screen.getByText(/velocity/i)).toBeInTheDocument();
    expect(screen.getByText(/45,123/)).toBeInTheDocument();
  });

  it('should render miss distance', () => {
    render(<NEOCard neo={mockNEO} />);
    expect(screen.getByText(/distance/i)).toBeInTheDocument();
    expect(screen.getByText(/12,345,678/)).toBeInTheDocument();
  });

  it('should indicate non-hazardous asteroid', () => {
    render(<NEOCard neo={mockNEO} />);
    expect(screen.getByText(/safe/i)).toBeInTheDocument();
    expect(screen.queryByText(/hazardous/i)).not.toBeInTheDocument();
  });

  it('should indicate hazardous asteroid', () => {
    const hazardousNEO = {
      ...mockNEO,
      is_potentially_hazardous_asteroid: true,
    };
    render(<NEOCard neo={hazardousNEO} />);
    expect(screen.getByText(/hazardous/i)).toBeInTheDocument();
  });

  it('should render with proper styling', () => {
    render(<NEOCard neo={mockNEO} />);
    const card = screen.getByText('54016 (1999 JV3)').closest('div');
    expect(card).toHaveClass('glass-effect');
  });

  it('should handle missing data gracefully', () => {
    const incompleteNEO = {
      id: '123',
      name: 'Test NEO',
      estimated_diameter: {},
      close_approach_data: [],
    };
    render(<NEOCard neo={incompleteNEO} />);
    expect(screen.getByText('Test NEO')).toBeInTheDocument();
  });
});

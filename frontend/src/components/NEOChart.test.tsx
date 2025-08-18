import React from 'react';
import { render, screen } from '@testing-library/react';
import NEOChart from './NEOChart';

// Mock recharts
jest.mock('recharts', () => ({
  BarChart: ({ children, ...props }: any) => (
    <div data-testid="bar-chart" {...props}>
      {children}
    </div>
  ),
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  PieChart: ({ children, ...props }: any) => (
    <div data-testid="pie-chart" {...props}>
      {children}
    </div>
  ),
  Pie: (props: any) => <div data-testid="pie" {...props} />,
  Cell: (props: any) => <div data-testid="cell" {...props} />,
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => (
    <div data-testid="cartesian-grid" {...props} />
  ),
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>
      {children}
    </div>
  ),
  ScatterChart: ({ children, ...props }: any) => (
    <div data-testid="scatter-chart" {...props}>
      {children}
    </div>
  ),
  Scatter: (props: any) => <div data-testid="scatter" {...props} />,
}));

const mockNEOData = [
  {
    id: '1',
    name: 'Test Asteroid 1',
    absolute_magnitude_h: 22.1,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: 0.1,
        estimated_diameter_max: 0.3,
      },
    },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [
      {
        close_approach_date: '2025-01-01',
        relative_velocity: {
          kilometers_per_second: '15.5',
        },
        miss_distance: {
          kilometers: '1000000',
          lunar: '2.6',
        },
      },
    ],
  },
  {
    id: '2',
    name: 'Test Asteroid 2',
    absolute_magnitude_h: 20.5,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: 0.2,
        estimated_diameter_max: 0.5,
      },
    },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [
      {
        close_approach_date: '2025-01-02',
        relative_velocity: {
          kilometers_per_second: '20.2',
        },
        miss_distance: {
          kilometers: '500000',
          lunar: '1.3',
        },
      },
    ],
  },
];

describe('NEOChart', () => {
  test('renders multiple charts with NEO data', () => {
    render(<NEOChart neos={mockNEOData} />);

    // Should render multiple chart containers
    const containers = screen.getAllByTestId('responsive-container');
    expect(containers.length).toBeGreaterThan(0);
  });

  test('renders pie chart for hazard distribution', () => {
    render(<NEOChart neos={mockNEOData} />);

    // The component renders a pie chart for hazard data
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  test('renders bar chart for size distribution', () => {
    render(<NEOChart neos={mockNEOData} />);

    // The component renders a bar chart for size categories
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
  });

  test('renders line chart for approach dates', () => {
    render(<NEOChart neos={mockNEOData} />);

    // The component renders a line chart for velocity over time
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  test('renders scatter chart for velocity vs distance', () => {
    render(<NEOChart neos={mockNEOData} />);

    // The component renders a scatter chart
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    expect(screen.getByTestId('scatter')).toBeInTheDocument();
  });

  test('handles empty NEO array', () => {
    render(<NEOChart neos={[]} />);

    // Should still render chart containers even with no data
    const containers = screen.getAllByTestId('responsive-container');
    expect(containers.length).toBeGreaterThan(0);
  });

  test('applies custom className', () => {
    const { container } = render(
      <NEOChart neos={mockNEOData} className="custom-chart-class" />
    );

    expect(container.firstChild).toHaveClass('custom-chart-class');
  });

  test('renders chart axes', () => {
    render(<NEOChart neos={mockNEOData} />);

    expect(screen.getAllByTestId('x-axis').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('y-axis').length).toBeGreaterThan(0);
  });

  test('renders tooltips for charts', () => {
    render(<NEOChart neos={mockNEOData} />);

    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  test('renders grid for line chart', () => {
    render(<NEOChart neos={mockNEOData} />);

    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });
});

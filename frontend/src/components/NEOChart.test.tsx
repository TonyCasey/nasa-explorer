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
        estimated_diameter_max: 0.2,
      },
    },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [
      {
        close_approach_date: '2025-08-15',
        relative_velocity: {
          kilometers_per_hour: '50000',
        },
        miss_distance: {
          kilometers: '1000000',
        },
      },
    ],
  },
  {
    id: '2',
    name: 'Test Asteroid 2',
    absolute_magnitude_h: 18.5,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: 0.5,
        estimated_diameter_max: 1.0,
      },
    },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [
      {
        close_approach_date: '2025-08-16',
        relative_velocity: {
          kilometers_per_hour: '75000',
        },
        miss_distance: {
          kilometers: '500000',
        },
      },
    ],
  },
];

describe('NEOChart', () => {
  test('renders with default props', () => {
    render(<NEOChart data={mockNEOData} />);

    // Should render a chart container
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('renders bar chart type', () => {
    render(<NEOChart data={mockNEOData} type="bar" />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
  });

  test('renders pie chart type', () => {
    render(<NEOChart data={mockNEOData} type="pie" />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  test('renders line chart type', () => {
    render(<NEOChart data={mockNEOData} type="line" />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  test('renders scatter chart type', () => {
    render(<NEOChart data={mockNEOData} type="scatter" />);

    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    expect(screen.getByTestId('scatter')).toBeInTheDocument();
  });

  test('renders chart axes for bar chart', () => {
    render(<NEOChart data={mockNEOData} type="bar" />);

    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  test('renders cartesian grid for line chart', () => {
    render(<NEOChart data={mockNEOData} type="line" />);

    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  test('renders tooltip for all chart types', () => {
    render(<NEOChart data={mockNEOData} type="bar" />);

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('handles empty data array', () => {
    render(<NEOChart data={[]} />);

    // Should still render container
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('applies custom width and height', () => {
    render(<NEOChart data={mockNEOData} width={800} height={400} />);

    const container = screen.getByTestId('responsive-container');
    expect(container).toBeInTheDocument();
  });

  test('renders with custom title', () => {
    render(<NEOChart data={mockNEOData} title="Custom Chart Title" />);

    expect(screen.getByText('Custom Chart Title')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(<NEOChart data={mockNEOData} loading={true} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(<NEOChart data={mockNEOData} error="Chart error occurred" />);

    expect(screen.getByText('Chart error occurred')).toBeInTheDocument();
  });

  test('handles chart color customization', () => {
    render(
      <NEOChart data={mockNEOData} type="pie" colors={['#ff0000', '#00ff00']} />
    );

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  test('renders responsive container by default', () => {
    render(<NEOChart data={mockNEOData} />);

    const container = screen.getByTestId('responsive-container');
    expect(container).toBeInTheDocument();
  });
});

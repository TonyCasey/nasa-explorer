import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoverFilters, { IRoverFilters } from './RoverFilters';

// Mock DatePicker component
jest.mock('./DatePicker', () => {
  return function MockDatePicker({ selectedDate, onDateChange }: any) {
    return (
      <input
        data-testid="date-picker"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
      />
    );
  };
});

const mockOnFiltersChange = jest.fn();

const defaultFilters: IRoverFilters = {
  rover: 'curiosity',
  sol: 1000,
  camera: 'FHAZ',
  earthDate: '',
};

const defaultProps = {
  filters: defaultFilters,
  onFiltersChange: mockOnFiltersChange,
};

describe('RoverFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all rover options', () => {
    render(<RoverFilters {...defaultProps} />);

    expect(screen.getByText('Curiosity')).toBeInTheDocument();
    expect(screen.getByText('Perseverance')).toBeInTheDocument();
    expect(screen.getByText('Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Spirit')).toBeInTheDocument();
  });

  test('highlights selected rover', () => {
    render(<RoverFilters {...defaultProps} />);

    const curiosityButton = screen.getByText('Curiosity').closest('button');
    expect(curiosityButton).toHaveClass('bg-cosmic-purple/20');
  });

  test('changes rover selection', () => {
    render(<RoverFilters {...defaultProps} />);

    const perseveranceButton = screen
      .getByText('Perseverance')
      .closest('button');
    fireEvent.click(perseveranceButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      rover: 'perseverance',
      camera: '', // Camera should reset when rover changes
    });
  });

  test('renders camera options for selected rover', () => {
    render(<RoverFilters {...defaultProps} />);

    expect(
      screen.getByText('FHAZ - Front Hazard Avoidance Camera')
    ).toBeInTheDocument();
    expect(
      screen.getByText('RHAZ - Rear Hazard Avoidance Camera')
    ).toBeInTheDocument();
    expect(screen.getByText('MAST - Mast Camera')).toBeInTheDocument();
  });

  test('changes camera selection', () => {
    render(<RoverFilters {...defaultProps} />);

    const cameraSelect = screen.getByRole('combobox');
    fireEvent.change(cameraSelect, { target: { value: 'MAST' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      camera: 'MAST',
    });
  });

  test('clears camera selection', () => {
    render(<RoverFilters {...defaultProps} />);

    const cameraSelect = screen.getByRole('combobox');
    fireEvent.change(cameraSelect, { target: { value: '' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      camera: undefined,
    });
  });

  test('renders sol input', () => {
    render(<RoverFilters {...defaultProps} />);

    const solInput = screen.getByPlaceholderText('e.g., 1000');
    expect(solInput).toBeInTheDocument();
  });

  test('changes sol value', () => {
    render(<RoverFilters {...defaultProps} />);

    const solInput = screen.getByPlaceholderText('e.g., 1000');
    fireEvent.change(solInput, { target: { value: '2000' } });
    fireEvent.blur(solInput);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: 2000,
      earthDate: '',
    });
  });

  test('renders earth date picker', () => {
    render(<RoverFilters {...defaultProps} />);

    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });

  test('changes earth date', () => {
    render(<RoverFilters {...defaultProps} />);

    const datePicker = screen.getByTestId('date-picker');
    fireEvent.change(datePicker, { target: { value: '2025-08-15' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      earthDate: '2025-08-15',
      sol: undefined,
    });
  });

  test('shows loading state', () => {
    render(<RoverFilters {...defaultProps} isLoading={true} />);

    const curiosityButton = screen.getByText('Curiosity').closest('button');
    expect(curiosityButton).toBeDisabled();

    const solInput = screen.getByPlaceholderText('e.g., 1000');
    expect(solInput).toBeDisabled();
  });

  test('shows both sol and earth date inputs', () => {
    render(<RoverFilters {...defaultProps} />);

    // Both inputs should be visible
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., 1000')).toBeInTheDocument();
  });

  test('clears sol when earth date is set', () => {
    render(<RoverFilters {...defaultProps} />);

    const datePicker = screen.getByTestId('date-picker');
    fireEvent.change(datePicker, { target: { value: '2025-08-15' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      earthDate: '2025-08-15',
      sol: undefined,
    });
  });

  test('clears earth date when sol is set', () => {
    const filtersWithEarthDate = {
      ...defaultFilters,
      sol: undefined,
      earthDate: '2025-08-15',
    };

    render(
      <RoverFilters
        filters={filtersWithEarthDate}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const solInput = screen.getByPlaceholderText('e.g., 1000');
    fireEvent.change(solInput, { target: { value: '1500' } });
    fireEvent.blur(solInput);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithEarthDate,
      earthDate: '',
      sol: 1500,
    });
  });

  test('applies custom className', () => {
    const { container } = render(
      <RoverFilters {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('shows rover status indicators', () => {
    render(<RoverFilters {...defaultProps} />);

    // Active appears twice (Curiosity and Perseverance)
    expect(screen.getAllByText('🟢 Active')).toHaveLength(2);
    expect(screen.getAllByText('🔴 Mission Complete')).toHaveLength(2);
  });

  test('validates sol input range', () => {
    render(<RoverFilters {...defaultProps} />);

    const solInput = screen.getByPlaceholderText('e.g., 1000');

    // Test negative value
    fireEvent.change(solInput, { target: { value: '-1' } });
    fireEvent.blur(solInput);
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: -1,
      earthDate: '',
    });

    jest.clearAllMocks();

    // Test very large value
    fireEvent.change(solInput, { target: { value: '999999' } });
    fireEvent.blur(solInput);
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: 999999,
      earthDate: '',
    });
  });

  test('shows different cameras for different rovers', () => {
    const { rerender } = render(<RoverFilters {...defaultProps} />);

    // Curiosity cameras
    expect(
      screen.getByText('CHEMCAM - Chemistry and Camera Complex')
    ).toBeInTheDocument();

    // Switch to Perseverance
    const perseveranceFilters = {
      ...defaultFilters,
      rover: 'perseverance',
      camera: '',
    };
    rerender(
      <RoverFilters
        filters={perseveranceFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('SUPERCAM - SuperCam')).toBeInTheDocument();
    expect(
      screen.queryByText('CHEMCAM - Chemistry and Camera Complex')
    ).not.toBeInTheDocument();
  });

  test('resets filters button works', () => {
    render(<RoverFilters {...defaultProps} />);

    const resetButton = screen.getByText('Clear All');
    fireEvent.click(resetButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      rover: 'curiosity',
      sol: undefined,
      camera: undefined,
      earthDate: '',
    });
  });

  test('handles empty sol input', () => {
    render(<RoverFilters {...defaultProps} />);

    const solInput = screen.getByPlaceholderText('e.g., 1000');
    fireEvent.change(solInput, { target: { value: '' } });
    fireEvent.blur(solInput);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: undefined,
      earthDate: '',
    });
  });

  test('shows camera count for each rover', () => {
    render(<RoverFilters {...defaultProps} />);

    // Should show some indication of camera availability
    expect(screen.getByText(/cameras/i)).toBeInTheDocument();
  });

  test('preserves other filters when changing one', () => {
    render(<RoverFilters {...defaultProps} />);

    const solInput = screen.getByPlaceholderText('e.g., 1000');
    fireEvent.change(solInput, { target: { value: '1500' } });
    fireEvent.blur(solInput);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      rover: 'curiosity', // preserved
      camera: 'FHAZ', // preserved
      earthDate: '', // cleared when sol is set
      sol: 1500, // changed
    });
  });

  test('shows filter summary', () => {
    render(<RoverFilters {...defaultProps} />);

    expect(screen.getByText('curiosity')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('FHAZ')).toBeInTheDocument();
  });
});

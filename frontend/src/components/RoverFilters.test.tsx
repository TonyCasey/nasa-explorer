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
    
    expect(screen.getByText('🔍 Curiosity')).toBeInTheDocument();
    expect(screen.getByText('🎯 Perseverance')).toBeInTheDocument();
    expect(screen.getByText('⚡ Opportunity')).toBeInTheDocument();
    expect(screen.getByText('👻 Spirit')).toBeInTheDocument();
  });

  test('highlights selected rover', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const curiosityButton = screen.getByText('🔍 Curiosity').closest('button');
    expect(curiosityButton).toHaveClass('bg-cosmic-purple/20');
  });

  test('changes rover selection', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const perseveranceButton = screen.getByText('🎯 Perseverance');
    fireEvent.click(perseveranceButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      rover: 'perseverance',
      camera: undefined, // Camera should reset when rover changes
    });
  });

  test('renders camera options for selected rover', () => {
    render(<RoverFilters {...defaultProps} />);
    
    expect(screen.getByText('Front Hazard Avoidance Camera')).toBeInTheDocument();
    expect(screen.getByText('Rear Hazard Avoidance Camera')).toBeInTheDocument();
    expect(screen.getByText('Mast Camera')).toBeInTheDocument();
  });

  test('changes camera selection', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const mastCameraOption = screen.getByText('Mast Camera');
    fireEvent.click(mastCameraOption);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      camera: 'MAST',
    });
  });

  test('clears camera selection', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const allCamerasOption = screen.getByText('All Cameras');
    fireEvent.click(allCamerasOption);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      camera: undefined,
    });
  });

  test('renders sol input', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const solInput = screen.getByLabelText(/Sol/);
    expect(solInput).toHaveValue(1000);
  });

  test('changes sol value', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const solInput = screen.getByLabelText(/Sol/);
    fireEvent.change(solInput, { target: { value: '2000' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: 2000,
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
    });
  });

  test('shows loading state', () => {
    render(<RoverFilters {...defaultProps} isLoading={true} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  test('toggles between sol and earth date', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const earthDateTab = screen.getByText('Earth Date');
    fireEvent.click(earthDateTab);
    
    expect(screen.getByTestId('date-picker')).toBeVisible();
    expect(screen.queryByLabelText(/Sol/)).not.toBeVisible();
  });

  test('clears sol when switching to earth date', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const earthDateTab = screen.getByText('Earth Date');
    fireEvent.click(earthDateTab);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: undefined,
    });
  });

  test('clears earth date when switching to sol', () => {
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
    
    const solTab = screen.getByText('Sol');
    fireEvent.click(solTab);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithEarthDate,
      earthDate: '',
      sol: 0,
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
    
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('complete')).toBeInTheDocument();
  });

  test('validates sol input range', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const solInput = screen.getByLabelText(/Sol/);
    
    // Test negative value
    fireEvent.change(solInput, { target: { value: '-1' } });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: 0,
    });
    
    // Test very large value
    fireEvent.change(solInput, { target: { value: '999999' } });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: 10000, // Should be capped at max
    });
  });

  test('shows different cameras for different rovers', () => {
    const { rerender } = render(<RoverFilters {...defaultProps} />);
    
    // Curiosity cameras
    expect(screen.getByText('Chemistry and Camera Complex')).toBeInTheDocument();
    
    // Switch to Perseverance
    const perseveranceFilters = { ...defaultFilters, rover: 'perseverance' };
    rerender(
      <RoverFilters
        filters={perseveranceFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );
    
    expect(screen.getByText('SuperCam')).toBeInTheDocument();
    expect(screen.queryByText('Chemistry and Camera Complex')).not.toBeInTheDocument();
  });

  test('resets filters button works', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const resetButton = screen.getByText('Reset Filters');
    fireEvent.click(resetButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      rover: 'curiosity',
      sol: 0,
      camera: undefined,
      earthDate: '',
    });
  });

  test('handles empty sol input', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const solInput = screen.getByLabelText(/Sol/);
    fireEvent.change(solInput, { target: { value: '' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: 0,
    });
  });

  test('shows camera count for each rover', () => {
    render(<RoverFilters {...defaultProps} />);
    
    // Should show some indication of camera availability
    expect(screen.getByText(/cameras/i)).toBeInTheDocument();
  });

  test('preserves other filters when changing one', () => {
    render(<RoverFilters {...defaultProps} />);
    
    const solInput = screen.getByLabelText(/Sol/);
    fireEvent.change(solInput, { target: { value: '1500' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      rover: 'curiosity', // preserved
      camera: 'FHAZ', // preserved
      earthDate: '', // preserved
      sol: 1500, // changed
    });
  });

  test('shows filter summary', () => {
    render(<RoverFilters {...defaultProps} />);
    
    expect(screen.getByText(/Curiosity/)).toBeInTheDocument();
    expect(screen.getByText(/Sol 1000/)).toBeInTheDocument();
    expect(screen.getByText(/FHAZ/)).toBeInTheDocument();
  });
});
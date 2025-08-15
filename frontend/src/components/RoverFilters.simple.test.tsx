import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoverFilters from './RoverFilters';

describe('RoverFilters', () => {
  const mockOnFilterChange = jest.fn();
  const defaultFilters = {
    rover: 'curiosity',
    camera: 'all',
    sol: '',
    earthDate: ''
  };

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('should render rover selector', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    expect(screen.getByLabelText(/rover/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('curiosity')).toBeInTheDocument();
  });

  it('should render camera selector', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    expect(screen.getByLabelText(/camera/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('all')).toBeInTheDocument();
  });

  it('should render sol input', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    expect(screen.getByLabelText(/sol/i)).toBeInTheDocument();
  });

  it('should render earth date picker', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    expect(screen.getByLabelText(/earth date/i)).toBeInTheDocument();
  });

  it('should handle rover change', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    const roverSelect = screen.getByLabelText(/rover/i);
    
    fireEvent.change(roverSelect, { target: { value: 'perseverance' } });
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      rover: 'perseverance'
    });
  });

  it('should handle camera change', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    const cameraSelect = screen.getByLabelText(/camera/i);
    
    fireEvent.change(cameraSelect, { target: { value: 'fhaz' } });
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      camera: 'fhaz'
    });
  });

  it('should handle sol change', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    const solInput = screen.getByLabelText(/sol/i);
    
    fireEvent.change(solInput, { target: { value: '1000' } });
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sol: '1000'
    });
  });

  it('should handle earth date change', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    const dateInput = screen.getByLabelText(/earth date/i);
    
    fireEvent.change(dateInput, { target: { value: '2025-08-15' } });
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      earthDate: '2025-08-15'
    });
  });

  it('should render available cameras for rover', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    
    // Check that camera options are rendered
    const cameraSelect = screen.getByLabelText(/camera/i);
    expect(cameraSelect.children.length).toBeGreaterThan(1);
  });

  it('should handle reset filters', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    const resetButton = screen.getByText(/reset/i);
    
    fireEvent.click(resetButton);
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      rover: 'curiosity',
      camera: 'all',
      sol: '',
      earthDate: ''
    });
  });

  it('should validate sol input', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);
    const solInput = screen.getByLabelText(/sol/i);
    
    fireEvent.change(solInput, { target: { value: '-1' } });
    expect(screen.getByText(/invalid sol/i)).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<RoverFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} loading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DatePicker from './DatePicker';

describe('DatePicker', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render date input', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} />);
    const input = screen.getByDisplayValue('2025-08-15');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'date');
  });

  it('should handle date change', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} />);
    const input = screen.getByDisplayValue('2025-08-15');
    
    fireEvent.change(input, { target: { value: '2025-08-16' } });
    expect(mockOnChange).toHaveBeenCalledWith('2025-08-16');
  });

  it('should render with label', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} label="Select Date" />);
    expect(screen.getByText('Select Date')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} disabled={true} />);
    const input = screen.getByDisplayValue('2025-08-15');
    expect(input).toBeDisabled();
  });

  it('should handle min date constraint', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} min="2025-01-01" />);
    const input = screen.getByDisplayValue('2025-08-15');
    expect(input).toHaveAttribute('min', '2025-01-01');
  });

  it('should handle max date constraint', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} max="2025-12-31" />);
    const input = screen.getByDisplayValue('2025-08-15');
    expect(input).toHaveAttribute('max', '2025-12-31');
  });

  it('should render error state', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} error="Invalid date" />);
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
    const input = screen.getByDisplayValue('2025-08-15');
    expect(input).toHaveClass('border-red-500');
  });

  it('should handle placeholder', () => {
    render(<DatePicker value="" onChange={mockOnChange} placeholder="Choose a date" />);
    const input = screen.getByPlaceholderText('Choose a date');
    expect(input).toBeInTheDocument();
  });

  it('should handle required field', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} required={true} />);
    const input = screen.getByDisplayValue('2025-08-15');
    expect(input).toBeRequired();
  });

  it('should handle keyboard navigation', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} />);
    const input = screen.getByDisplayValue('2025-08-15');
    
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveFocus();
  });

  it('should format date correctly', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} />);
    const input = screen.getByDisplayValue('2025-08-15');
    expect(input.value).toBe('2025-08-15');
  });

  it('should handle clear functionality', () => {
    render(<DatePicker value="2025-08-15" onChange={mockOnChange} clearable={true} />);
    const clearButton = screen.getByLabelText(/clear/i);
    
    fireEvent.click(clearButton);
    expect(mockOnChange).toHaveBeenCalledWith('');
  });
});
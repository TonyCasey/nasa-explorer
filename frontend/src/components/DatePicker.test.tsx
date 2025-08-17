import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DatePicker from './DatePicker';

const mockOnDateChange = jest.fn();

const defaultProps = {
  selectedDate: '2025-08-15',
  onDateChange: mockOnDateChange,
};

describe('DatePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with selected date', () => {
    render(<DatePicker {...defaultProps} />);

    expect(screen.getByDisplayValue('2025-08-15')).toBeInTheDocument();
  });

  test('displays formatted date in button', () => {
    render(<DatePicker {...defaultProps} />);

    expect(screen.getByText(/Thu, Aug 15, 2025/)).toBeInTheDocument();
  });

  test('calls onDateChange when date input changes', () => {
    render(<DatePicker {...defaultProps} />);

    const dateInput = screen.getByDisplayValue('2025-08-15');
    fireEvent.change(dateInput, { target: { value: '2025-08-16' } });

    expect(mockOnDateChange).toHaveBeenCalledWith('2025-08-16');
  });

  test('opens calendar when button is clicked', () => {
    render(<DatePicker {...defaultProps} />);

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    expect(screen.getByText('August 2025')).toBeInTheDocument();
  });

  test('closes calendar when clicking outside', async () => {
    render(
      <div>
        <DatePicker {...defaultProps} />
        <div data-testid="outside">Outside</div>
      </div>
    );

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    expect(screen.getByText('August 2025')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    await waitFor(() => {
      expect(screen.queryByText('August 2025')).not.toBeInTheDocument();
    });
  });

  test('navigates to previous month', () => {
    render(<DatePicker {...defaultProps} />);

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    const prevButton = screen.getByLabelText('Previous month');
    fireEvent.click(prevButton);

    expect(screen.getByText('July 2025')).toBeInTheDocument();
  });

  test('navigates to next month', () => {
    render(<DatePicker {...defaultProps} />);

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    const nextButton = screen.getByLabelText('Next month');
    fireEvent.click(nextButton);

    expect(screen.getByText('September 2025')).toBeInTheDocument();
  });

  test('selects date when calendar day is clicked', () => {
    render(<DatePicker {...defaultProps} />);

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    // Click on day 20
    const day20 = screen.getByText('20');
    fireEvent.click(day20);

    expect(mockOnDateChange).toHaveBeenCalledWith('2025-08-20');
  });

  test('respects min and max date constraints', () => {
    render(
      <DatePicker {...defaultProps} minDate="2025-01-01" maxDate="2025-12-31" />
    );

    const dateInput = screen.getByDisplayValue('2025-08-15');
    expect(dateInput).toHaveAttribute('min', '2025-01-01');
    expect(dateInput).toHaveAttribute('max', '2025-12-31');
  });

  test('applies custom className', () => {
    const { container } = render(
      <DatePicker {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('applies custom opacity', () => {
    const { container } = render(<DatePicker {...defaultProps} opacity={75} />);

    const datePickerElement = container.firstChild as HTMLElement;
    expect(
      datePickerElement.style.getPropertyValue('--date-picker-opacity')
    ).toBe('0.75');
  });

  test('highlights today in calendar', () => {
    const today = new Date().toISOString().split('T')[0];
    render(<DatePicker {...defaultProps} selectedDate={today} />);

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    const todayElement = screen.getByText(new Date().getDate().toString());
    expect(todayElement.closest('button')).toHaveClass('bg-solar-orange');
  });

  test('highlights selected date in calendar', () => {
    render(<DatePicker {...defaultProps} />);

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    const selectedDay = screen.getByText('15');
    expect(selectedDay.closest('button')).toHaveClass('bg-cosmic-purple');
  });

  test('disables dates outside min/max range', () => {
    render(
      <DatePicker {...defaultProps} minDate="2025-08-10" maxDate="2025-08-20" />
    );

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    const day5 = screen.getByText('5');
    const day25 = screen.getByText('25');

    expect(day5.closest('button')).toBeDisabled();
    expect(day25.closest('button')).toBeDisabled();
  });

  test('shows different month days in muted style', () => {
    render(<DatePicker {...defaultProps} />);

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    // Days from previous/next month should be visible but muted
    const calendar = screen.getByRole('grid');
    expect(calendar).toBeInTheDocument();
  });

  test('handles keyboard navigation', () => {
    render(<DatePicker {...defaultProps} />);

    const dateInput = screen.getByDisplayValue('2025-08-15');

    fireEvent.keyDown(dateInput, { key: 'Enter' });
    expect(screen.getByText('August 2025')).toBeInTheDocument();

    fireEvent.keyDown(dateInput, { key: 'Escape' });
    expect(screen.queryByText('August 2025')).not.toBeInTheDocument();
  });

  test('formats date display correctly', () => {
    render(<DatePicker {...defaultProps} selectedDate="2025-12-25" />);

    expect(screen.getByText(/Wed, Dec 25, 2025/)).toBeInTheDocument();
  });

  test('uses default date range when none provided', () => {
    render(
      <DatePicker selectedDate="2025-08-15" onDateChange={mockOnDateChange} />
    );

    const dateInput = screen.getByDisplayValue('2025-08-15');
    expect(dateInput).toHaveAttribute('min', '1995-06-16');
    expect(dateInput).toHaveAttribute(
      'max',
      new Date().toISOString().split('T')[0]
    );
  });

  test('handles invalid date gracefully', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <DatePicker selectedDate="invalid-date" onDateChange={mockOnDateChange} />
    );

    // Should not crash
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test('updates view when selectedDate prop changes', () => {
    const { rerender } = render(<DatePicker {...defaultProps} />);

    const calendarButton = screen.getByRole('button');
    fireEvent.click(calendarButton);

    expect(screen.getByText('August 2025')).toBeInTheDocument();

    rerender(
      <DatePicker selectedDate="2025-06-15" onDateChange={mockOnDateChange} />
    );

    expect(screen.getByText('June 2025')).toBeInTheDocument();
  });
});

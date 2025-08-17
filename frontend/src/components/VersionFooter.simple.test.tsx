import React from 'react';
import { render, screen } from '@testing-library/react';
import VersionFooter from './VersionFooter';

describe('VersionFooter', () => {
  it('should render version information', () => {
    render(<VersionFooter />);
    expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument();
  });

  it('should render NASA attribution', () => {
    render(<VersionFooter />);
    expect(screen.getByText(/NASA/)).toBeInTheDocument();
  });

  it('should render build information', () => {
    render(<VersionFooter />);
    expect(screen.getByText(/built/i)).toBeInTheDocument();
  });

  it('should render with proper styling', () => {
    render(<VersionFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('text-center');
  });

  it('should render copyright information', () => {
    render(<VersionFooter />);
    expect(screen.getByText(/©|copyright/i)).toBeInTheDocument();
  });

  it('should render current year', () => {
    render(<VersionFooter />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<VersionFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
});

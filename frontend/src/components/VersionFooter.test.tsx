import React from 'react';
import { render, screen } from '@testing-library/react';
import VersionFooter from './VersionFooter';

// Mock version utility
jest.mock('../utils/version', () => ({
  getVersionString: () => 'v1.0.0',
  getBuildInfo: () => 'Build 123 (8/15/2025, 12:00:00 PM)',
  VERSION_INFO: {
    major: 1,
    minor: 0,
    build: 123,
    version: '1.0.0',
    buildDate: '2025-08-15T12:00:00Z',
    description: 'Test Version',
  },
}));

describe('VersionFooter', () => {
  it('renders version footer', () => {
    render(<VersionFooter />);

    expect(screen.getByTestId('version-footer')).toBeInTheDocument();
  });

  it('displays version number', () => {
    render(<VersionFooter />);

    expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
  });

  it('displays build info', () => {
    render(<VersionFooter />);

    expect(screen.getByText(/Build 123/)).toBeInTheDocument();
  });

  it('displays NASA Space Explorer title', () => {
    render(<VersionFooter />);

    expect(screen.getByText('NASA Space Explorer')).toBeInTheDocument();
  });

  it('displays passion message', () => {
    render(<VersionFooter />);

    expect(
      screen.getByText(/Built with passion for space exploration/)
    ).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<VersionFooter />);

    const footer = screen.getByTestId('version-footer');
    expect(footer).toHaveClass('glass-effect');
  });

  it('displays in minimal mode when specified', () => {
    render(<VersionFooter minimal />);

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.queryByText('NASA Space Explorer')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<VersionFooter className="custom-class" />);

    const footer = screen.getByTestId('version-footer');
    expect(footer).toHaveClass('custom-class');
  });
});

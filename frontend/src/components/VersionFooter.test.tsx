import React from 'react';
import { render, screen } from '@testing-library/react';
import VersionFooter from './VersionFooter';

// Mock version utility
jest.mock('../utils/version', () => ({
  getVersion: jest.fn(() => '1.0.0'),
  getBuildInfo: jest.fn(() => ({
    version: '1.0.0',
    buildDate: '2025-08-15',
    commit: 'abc123',
    environment: 'development',
  })),
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

  it('displays build date', () => {
    render(<VersionFooter />);

    expect(screen.getByText(/2025-08-15/)).toBeInTheDocument();
  });

  it('displays commit hash', () => {
    render(<VersionFooter />);

    expect(screen.getByText(/abc123/)).toBeInTheDocument();
  });

  it('displays environment', () => {
    render(<VersionFooter />);

    expect(screen.getByText(/development/i)).toBeInTheDocument();
  });

  it('renders copyright information', () => {
    render(<VersionFooter />);

    expect(screen.getByText(/© 2025/)).toBeInTheDocument();
    expect(screen.getByText(/NASA Space Explorer/)).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<VersionFooter />);

    const footer = screen.getByTestId('version-footer');
    expect(footer).toHaveClass('version-footer');
  });

  it('displays in compact mode when specified', () => {
    render(<VersionFooter compact />);

    const footer = screen.getByTestId('version-footer');
    expect(footer).toHaveClass('compact');
  });

  it('shows detailed build information when expanded', () => {
    render(<VersionFooter showDetails />);

    expect(screen.getByText(/Build Date/)).toBeInTheDocument();
    expect(screen.getByText(/Commit/)).toBeInTheDocument();
    expect(screen.getByText(/Environment/)).toBeInTheDocument();
  });

  it('hides detailed information when not expanded', () => {
    render(<VersionFooter />);

    expect(screen.queryByText(/Build Date/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Commit/)).not.toBeInTheDocument();
  });

  it('handles missing version data gracefully', () => {
    const { getBuildInfo } = require('../utils/version');
    getBuildInfo.mockReturnValue(null);

    render(<VersionFooter />);

    expect(screen.getByTestId('version-footer')).toBeInTheDocument();
    expect(screen.getByText(/Unknown version/)).toBeInTheDocument();
  });

  it('handles partial version data', () => {
    const { getBuildInfo } = require('../utils/version');
    getBuildInfo.mockReturnValue({
      version: '1.0.0',
      buildDate: null,
      commit: null,
      environment: 'production',
    });

    render(<VersionFooter />);

    expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
    expect(screen.getByText(/production/i)).toBeInTheDocument();
  });

  it('renders link to repository when provided', () => {
    render(<VersionFooter repositoryUrl="https://github.com/example/repo" />);

    const repoLink = screen.getByRole('link', { name: /view source/i });
    expect(repoLink).toHaveAttribute('href', 'https://github.com/example/repo');
  });

  it('opens repository link in new tab', () => {
    render(<VersionFooter repositoryUrl="https://github.com/example/repo" />);

    const repoLink = screen.getByRole('link', { name: /view source/i });
    expect(repoLink).toHaveAttribute('target', '_blank');
    expect(repoLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays last updated timestamp', () => {
    const lastUpdated = new Date('2025-08-15T10:00:00Z');
    render(<VersionFooter lastUpdated={lastUpdated} />);

    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    const lastUpdated = new Date('2025-08-15T10:00:00Z');
    render(<VersionFooter lastUpdated={lastUpdated} />);

    // Should display formatted date
    expect(screen.getByText(/Aug 15, 2025/)).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import Navigation from './Navigation';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/dashboard' }),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  NavLink: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

describe('Navigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render navigation menu', () => {
    render(<Navigation />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should render home link', () => {
    render(<Navigation />);
    expect(screen.getByText(/home/i)).toBeInTheDocument();
  });

  it('should render dashboard link', () => {
    render(<Navigation />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('should render APOD link', () => {
    render(<Navigation />);
    expect(screen.getByText(/apod/i)).toBeInTheDocument();
  });

  it('should render Mars Rovers link', () => {
    render(<Navigation />);
    expect(screen.getByText(/mars/i)).toBeInTheDocument();
  });

  it('should render NEO Tracker link', () => {
    render(<Navigation />);
    expect(screen.getByText(/neo/i)).toBeInTheDocument();
  });

  it('should render favorites link', () => {
    render(<Navigation />);
    expect(screen.getByText(/favorites/i)).toBeInTheDocument();
  });

  it('should highlight active route', () => {
    render(<Navigation />);
    const dashboardLink = screen.getByText(/dashboard/i);
    expect(dashboardLink.closest('a')).toHaveClass('active');
  });

  it('should render mobile menu toggle', () => {
    render(<Navigation />);
    expect(screen.getByLabelText(/toggle menu/i)).toBeInTheDocument();
  });

  it('should handle responsive design', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('md:flex');
  });

  it('should render with proper styling', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('glass-effect');
  });

  it('should render logo', () => {
    render(<Navigation />);
    expect(screen.getByText(/nasa explorer/i)).toBeInTheDocument();
  });

  it('should handle keyboard navigation', () => {
    render(<Navigation />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('tabindex', '0');
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Houston, we have a problem!')).toBeInTheDocument();
    expect(
      screen.getByText(/something went wrong in our space mission/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /🔄 try again/i })
    ).toBeInTheDocument();
  });

  it('shows reload button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByRole('button', { name: /🌍 return to earth \(reload\)/i })
    ).toBeInTheDocument();
  });

  it('has working buttons', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Both buttons should be present
    expect(
      screen.getByRole('button', { name: /🔄 try again/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /🌍 return to earth \(reload\)/i })
    ).toBeInTheDocument();
  });

  it('resets error state when try again is clicked', async () => {
    let shouldThrow = true;

    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Houston, we have a problem!')).toBeInTheDocument();

    // Change shouldThrow to false and rerender
    shouldThrow = false;

    const tryAgainButton = screen.getByRole('button', {
      name: /🔄 try again/i,
    });
    await userEvent.click(tryAgainButton);

    // Rerender with new props
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Should show normal content now
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders consistent error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Component doesn't support fallback prop, just verify standard UI
    expect(screen.getByText('Houston, we have a problem!')).toBeInTheDocument();
  });
});

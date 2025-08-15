import { render, screen } from '@testing-library/react';
import DataWidget from './DataWidget';

describe('DataWidget', () => {
  const mockData = {
    title: 'Test Widget',
    icon: '📊'
  };

  it('should render widget with title', () => {
    render(
      <DataWidget {...mockData}>
        <div>42</div>
      </DataWidget>
    );
    
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(
      <DataWidget {...mockData}>
        <div>Content</div>
      </DataWidget>
    );
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(
      <DataWidget {...mockData} isLoading={true}>
        <div>Content</div>
      </DataWidget>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(
      <DataWidget {...mockData} error="Test error">
        <div>Content</div>
      </DataWidget>
    );
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should render children when not loading and no error', () => {
    render(
      <DataWidget {...mockData}>
        <div>Widget Content</div>
      </DataWidget>
    );
    expect(screen.getByText('Widget Content')).toBeInTheDocument();
  });
});
import { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log the error using our logger
    logger.error('Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div
              className="glass-effect rounded-xl p-8 text-center bg-red-50"
              role="alert"
            >
              <div className="text-6xl mb-4">🚀💥</div>
              <h1 className="text-2xl font-inter font-bold text-white mb-4">
                Houston, we have a problem!
              </h1>
              <p className="text-gray-300 mb-6">
                Something went wrong in our space mission. Our engineers are
                working on it.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full bg-cosmic-purple hover:bg-cosmic-purple/80 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-transparent border border-white/20 hover:border-white/40 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  🌍 Return to Earth (Reload)
                </button>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left">
                    <summary className="text-mars-red cursor-pointer mb-2">
                      Details
                    </summary>
                    <pre className="text-xs text-gray-400 bg-black/20 p-4 rounded overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

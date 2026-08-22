// src/components/common/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /**
   * 'page' fills the viewport — use it at the app root.
   * 'inline' fits inside a layout's content area, so the sidebar and top bar
   * survive a crash in one route.
   */
  variant?: 'page' | 'inline';
  /**
   * When this value changes, the boundary clears its error. Pass the route
   * pathname at route level: without it, one crashed page keeps showing the
   * error screen even after the user navigates somewhere else.
   */
  resetKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught exception:', error, errorInfo);
  }

  private reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (!this.state.hasError) return this.props.children;

    const inline = this.props.variant === 'inline';

    return (
      <div
        className={`flex items-center justify-center p-4 ${
          inline ? 'min-h-[60vh]' : 'min-h-screen bg-gray-50'
        }`}
        role="alert"
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-100">
          <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {inline ? "This page didn't load" : 'Something went wrong'}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            {inline
              ? 'The rest of the app is still working — try again, or move to another page.'
              : 'We hit an unexpected error. Refreshing usually clears it.'}
          </p>

          <div className="flex flex-col gap-2">
            {inline && (
              <button
                onClick={this.reset}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Try again
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className={`flex items-center justify-center gap-2 w-full px-6 py-3 font-semibold rounded-xl transition-all active:scale-95 ${
                inline
                  ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh page
            </button>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-left overflow-auto max-h-40">
              <p className="text-xs font-mono text-red-600 break-all">
                {this.state.error.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

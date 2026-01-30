import { Component, type ErrorInfo, type ReactNode } from 'react';

const DEBUG_INGEST = 'http://127.0.0.1:7242/ingest/09986fe5-9bd4-4263-a66c-7f830704a56d';

function logToDebug(payload: Record<string, unknown>) {
  fetch(DEBUG_INGEST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      timestamp: Date.now(),
      sessionId: 'debug-session',
    }),
  }).catch(() => {});
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AgentErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState((s) => ({ ...s, errorInfo }));
    // Debug: log to console for immediate inspection
    console.error('🔥 ErrorBoundary caught:', error);
    console.error('🔥 Component stack:', errorInfo.componentStack);
    // #region agent log
    logToDebug({
      hypothesisId: 'H1',
      location: 'AgentErrorBoundary:componentDidCatch',
      message: 'Agent tree threw',
      data: {
        errorMessage: error.message,
        errorStack: error.stack?.slice(0, 500),
        componentStack: errorInfo.componentStack?.slice(0, 500),
      },
    });
    // #endregion
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md space-y-4 rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold text-destructive">Algo salió mal</h2>
            <p className="text-sm text-muted-foreground">{this.state.error.message}</p>
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AUVRA ErrorBoundary]', error, info);
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-error-container bg-error-container/10 p-8 text-center animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-container">
            <AlertTriangle className="h-8 w-8 text-error" />
          </div>
          <h3 className="font-headline text-headline-md mb-2 text-on-surface">
            Terjadi Kesalahan
          </h3>
          <p className="text-body-md mb-6 max-w-sm text-on-surface-variant">
            Komponen ini mengalami error. Coba muat ulang atau hubungi tim support jika masalah berlanjut.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mb-4 max-h-24 w-full overflow-auto rounded-lg bg-surface-container p-3 text-left text-label-sm text-on-surface-variant">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-label-md font-medium text-on-primary transition-all hover:opacity-90 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
            <a
              href="mailto:support@auvra.io"
              className="flex items-center gap-2 rounded-lg border border-outline px-5 py-2.5 text-label-md font-medium text-on-surface transition-all hover:bg-surface-container"
            >
              <MessageCircle className="h-4 w-4" />
              Hubungi Support
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

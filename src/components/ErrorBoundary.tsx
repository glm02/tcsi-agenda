import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      const err = this.state.error;
      const message = err?.message?.trim();
      const stack = err?.stack;
      const hasDetails = import.meta.env.DEV && (message || stack);
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="rounded-2xl border border-border bg-card p-8 max-w-md">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Une erreur s&apos;est produite</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Rechargez la page ou cliquez sur Accueil pour réessayer.
            </p>
            {hasDetails && (
              <div className="text-left text-xs mb-6 p-3 bg-muted/50 rounded-lg border border-border">
                {message && (
                  <>
                    <p className="font-medium text-foreground mb-1">Message :</p>
                    <p className="font-mono break-words text-muted-foreground mb-2">{message}</p>
                  </>
                )}
                {stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Détails techniques (pour le debug)
                    </summary>
                    <pre className="mt-2 text-[10px] overflow-auto max-h-32 text-muted-foreground whitespace-pre-wrap break-all">{stack}</pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
              >
                <RefreshCw size={16} /> Recharger
              </button>
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted"
              >
                Accueil
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
